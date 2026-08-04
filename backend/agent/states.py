from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator


class File(BaseModel):
    path: str = Field(description="The path to the file — MUST be a .html, .css, or .js file only")
    purpose: str = Field(description="The purpose of the file, e.g. 'main HTML layout', 'styles', 'app logic'")

    @field_validator("path")
    @classmethod
    def must_be_web_file(cls, v: str) -> str:
        allowed = (".html", ".css", ".js")
        if not any(v.endswith(ext) for ext in allowed):
            # Coerce non-web files to js rather than failing
            return v.rsplit(".", 1)[0] + ".js" if "." in v else v + ".js"
        return v


class Plan(BaseModel):
    name: str = Field(description="The name of the app to be built")
    description: str = Field(description="A one-line description of the app")
    techstack: str = Field(
        description="Always 'HTML, CSS, JavaScript' — no backend, no npm, no frameworks",
        default="HTML, CSS, JavaScript"
    )
    features: list[str] = Field(description="A list of UI features the app should have")
    files: list[File] = Field(
        description="List of files to create — ONLY .html, .css, and .js files. Must include index.html."
    )

    @field_validator("files")
    @classmethod
    def must_have_index_html(cls, v: list[File]) -> list[File]:
        paths = [f.path for f in v]
        if "index.html" not in paths:
            v.insert(0, File(path="index.html", purpose="Main HTML entry point"))
        return v


class ImplementationTask(BaseModel):
    filepath: str = Field(description="The path to the .html, .css, or .js file to be written")
    task_description: str = Field(
        description="Detailed description of what to implement in this file — HTML structure, CSS rules, or JS functions"
    )

    @field_validator("filepath")
    @classmethod
    def must_be_web_file(cls, v: str) -> str:
        allowed = (".html", ".css", ".js")
        if not any(v.endswith(ext) for ext in allowed):
            return v.rsplit(".", 1)[0] + ".js" if "." in v else v + ".js"
        return v


class TaskPlan(BaseModel):
    implementation_steps: list[ImplementationTask] = Field(
        description="Ordered list of file-writing tasks — only .html, .css, .js files allowed"
    )
    model_config = ConfigDict(extra="allow")


class CoderState(BaseModel):
    task_plan: TaskPlan = Field(description="The plan for the task to be implemented")
    current_step_idx: int = Field(0, description="The index of the current step in the implementation steps")
    current_file_content: Optional[str] = Field(None, description="The content of the file currently being edited or created")