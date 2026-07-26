from dotenv import load_dotenv
from langchain.globals import set_verbose, set_debug
from langchain_groq.chat_models import ChatGroq
from langgraph.constants import END
from langgraph.graph import StateGraph
from pydantic import BaseModel, Field

from agent.prompts import *
from agent.states import *
from agent.tools import write_file, read_file, list_files

_ = load_dotenv()

set_debug(False)
set_verbose(False)

# Reliable 70B model on Groq
llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.2)


class GeneratedCode(BaseModel):
    code: str = Field(description="The complete, production-ready code for the target file. No placeholders, no markdown wrapping.")


def planner_agent(state: dict) -> dict:
    """Converts user prompt into a structured Plan (HTML/CSS/JS only)."""
    user_prompt = state["user_prompt"]
    resp = llm.with_structured_output(Plan).invoke(
        planner_prompt(user_prompt)
    )
    if resp is None:
        raise ValueError("Planner did not return a valid response.")
    return {"plan": resp}


def architect_agent(state: dict) -> dict:
    """Creates TaskPlan from Plan (web files only)."""
    plan: Plan = state["plan"]
    resp = llm.with_structured_output(TaskPlan).invoke(
        architect_prompt(plan=plan.model_dump_json())
    )
    if resp is None:
        raise ValueError("Architect did not return a valid response.")

    resp.plan = plan
    return {"task_plan": resp}


def coder_agent(state: dict) -> dict:
    """Writes code for each file in the implementation steps cleanly."""
    coder_state: CoderState = state.get("coder_state")
    if coder_state is None:
        coder_state = CoderState(task_plan=state["task_plan"], current_step_idx=0)

    steps = coder_state.task_plan.implementation_steps
    if coder_state.current_step_idx >= len(steps):
        return {"coder_state": coder_state, "status": "DONE"}

    current_task = steps[coder_state.current_step_idx]
    filepath = current_task.filepath

    # Skip non-web files safety check
    allowed_exts = (".html", ".css", ".js")
    if not any(filepath.endswith(ext) for ext in allowed_exts):
        coder_state.current_step_idx += 1
        return {"coder_state": coder_state}

    # Read existing project files for context
    existing_files_summary = ""
    try:
        file_list_str = list_files.invoke({"directory": "."})
        if file_list_str and "No files" not in file_list_str:
            contents = []
            for f in file_list_str.splitlines():
                f_strip = f.strip()
                if f_strip and f_strip != filepath:
                    c = read_file.invoke({"path": f_strip})
                    if c:
                        contents.append(f"--- File: {f_strip} ---\n{c}\n")
            if contents:
                existing_files_summary = "\nExisting files in project:\n" + "\n".join(contents)
    except Exception:
        pass

    prompt = (
        f"System Instruction: {coder_system_prompt()}\n\n"
        f"Target File: {filepath}\n"
        f"Task Description: {current_task.task_description}\n"
        f"{existing_files_summary}\n\n"
        f"Write the COMPLETE, high-quality production code for '{filepath}'. "
        f"Ensure it integrates seamlessly with the other files in the project."
    )

    try:
        res = llm.with_structured_output(GeneratedCode).invoke(prompt)
        code_content = res.code if res and res.code else ""
    except Exception:
        raw_res = llm.invoke(prompt)
        code_content = raw_res.content if hasattr(raw_res, 'content') else str(raw_res)

    if code_content:
        # Clean markdown code block formatting if present
        if code_content.startswith("```"):
            lines = code_content.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            code_content = "\n".join(lines)

    # Write file using tool's invoke method with dict input
    if code_content.strip():
        write_file.invoke({"path": filepath, "content": code_content})

    coder_state.current_step_idx += 1
    return {"coder_state": coder_state}


graph = StateGraph(dict)

graph.add_node("planner", planner_agent)
graph.add_node("architect", architect_agent)
graph.add_node("coder", coder_agent)

graph.add_edge("planner", "architect")
graph.add_edge("architect", "coder")
graph.add_conditional_edges(
    "coder",
    lambda s: "END" if s.get("status") == "DONE" else "coder",
    {"END": END, "coder": "coder"}
)

graph.set_entry_point("planner")
agent = graph.compile()

if __name__ == "__main__":
    result = agent.invoke(
        {"user_prompt": "Build a colourful modern calculator in HTML CSS and JS"},
        {"recursion_limit": 100}
    )
    print("Final State Success!")
