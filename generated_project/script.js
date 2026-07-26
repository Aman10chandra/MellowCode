<script>
// Define the product list and cart
let productList = [
  { id: 1, name: 'Product 1', price: 10.99 },
  { id: 2, name: 'Product 2', price: 9.99 },
  { id: 3, name: 'Product 3', price: 12.99 },
  { id: 4, name: 'Product 4', price: 8.99 },
  { id: 5, name: 'Product 5', price: 11.99 }
];
let cart = [];

// Function to add product to cart
function addProductToCart(productId) {
  const product = productList.find(p => p.id === productId);
  if (product) {
    const existingProduct = cart.find(p => p.id === productId);
    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    updateCart();
  }
}

// Function to remove product from cart
function removeProductFromCart(productId) {
  const productIndex = cart.findIndex(p => p.id === productId);
  if (productIndex !== -1) {
    const product = cart[productIndex];
    if (product.quantity > 1) {
      product.quantity--;
    } else {
      cart.splice(productIndex, 1);
    }
    updateCart();
  }
}

// Function to update cart
function updateCart() {
  const cartElement = document.getElementById('cart');
  cartElement.innerHTML = '';
  cart.forEach(product => {
    const productElement = document.createElement('li');
    productElement.innerHTML = `
      <span>${product.name} x ${product.quantity}</span>
      <span>$${(product.price * product.quantity).toFixed(2)}</span>
      <button class="remove-from-cart" data-product-id="${product.id}">Remove</button>
    `;
    cartElement.appendChild(productElement);
  });

  // Add event listeners to remove from cart buttons
  const removeFromCartButtons = document.querySelectorAll('.remove-from-cart');
  removeFromCartButtons.forEach(button => {
    button.addEventListener('click', () => {
      removeProductFromCart(parseInt(button.dataset.productId));
    });
  });
}

// Function to update product list
function updateProductList() {
  const productListElement = document.getElementById('product-list');
  productListElement.innerHTML = '';
  productList.forEach(product => {
    const productElement = document.createElement('li');
    productElement.innerHTML = `
      <span>${product.name}</span>
      <span>$${product.price}</span>
      <button class="add-to-cart" data-product-id="${product.id}">Add to Cart</button>
    `;
    productListElement.appendChild(productElement);
  });

  // Add event listeners to add to cart buttons
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
      addProductToCart(parseInt(button.dataset.productId));
    });
  });
}

// Initialize product list and cart
updateProductList();
updateCart();

</script>