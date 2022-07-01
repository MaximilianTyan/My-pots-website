function loadProducts() {
    fetch('../js/items.json')
  .then((res) => res.json())
  .then((data) => {
    generateCards(data);
  })
  .catch(showError())
  .catch(showError())
}



function showError() {
  document.getElementById('product_list').innerHTML = "<p>Sorry, the products couldn't load properly</p>";
}

function generateCards(Items) {
    template = document.getElementById('card_template').innerHTML;
    const container = document.getElementById('product_list');
    container.innerHTML = '';
    for (let id in Items) {
        Item = Items[id];

        ///console.log(Item.image_src, '../products/' + Item.image_src);
        new_card = template
        .replace(/{{name}}/g, Item.name)
        .replace(/{{image_src}}/g, '../products/' + Item.image_src)
        .replace(/{{alt_image}}/g, Item.alt_image)
        .replace(/{{id}}/g, id)
        .replace(/{{price}}/g, Item.price + '€');

        container.innerHTML = container.innerHTML + new_card;
    }
    console.log('cards initiated and loaded')
    
}

//-------------------------------------------------------
console.log('initiating cards')
loadProducts();
//loadCardTemplate();