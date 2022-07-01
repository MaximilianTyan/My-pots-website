function getItem(){
    const params = new URLSearchParams(window.location.search);
    let item = params.get("item");
    // console.log(typeof(item), item);
    return item;
}


function loadProducts() {
    fetch('../js/items.json')
    .then((res) => {return res.json()})
    .then((data) => {
        Items = data;
        showProducts();
        loadProductsImages();
        loadTextures();
        updateItem();
        //console.log(data);
    });
}

function showProducts() {
    let item = getItem()
    document.getElementById("item-name").innerHTML = 'Produit choisi: ' + Items[item].name;
}

function resetItem() {
    document.getElementById('form').reset();
    updateItem();
}


function updateItem() {
    
    if (Items != undefined) {
        updatePrice(calculatePrice());
        drawImages();
   }
    else {
        loadProducts();
    }
}

function getFormResults() {
    let fields = {};
    console.log(document.getElementsByTagName('input'))
    for (ele of document.getElementsByTagName('input')) {
        if (ele.id != 'reset_button' && ele.id != 'buy') {
            if (ele.type == 'radio') {
                if (ele.checked) {fields[ele.name] = ele;}
            }
            else {fields[ele.name] = ele;}
        }
    }
    //console.log(fields);
    return fields
}

function updatePrice(price) {
    document.getElementById("item-price").innerHTML = 'Prix : ' + price + "€";
}


function calculatePrice(unitary=false) {
    let item = getItem()
    let form = getFormResults();
    //console.log(form);
    let p=Items[item].price;

    switch (form['material'].id) {
        case 'ceramic':
            p=p+10;
            break;
        case 'plastic':
            p=p+5;
            break;
        case 'clay':
            p=p+15;
        }
    if (form["gift"].checked){
        p=p+3;
    }
    if (!unitary) {
        p=p * form["quantity"].value;

        if ((form["quantity"].value>10)){
            p=p-p/10;
        }
    }
    p = roundNumber(p,2);
    let decimal_part = roundNumber(p - Math.round(p), 2);
    if (decimal_part != 0) {
        let decimal_digits = String(Math.abs(decimal_part)).length - 2;
        if (decimal_digits < 2) {
            p = p + '0'.repeat(2 - decimal_digits);
        }
    }
    else {
        p += '.00';
    }
    //console.log(p, decimal_digits, String(roundNumber(p - Math.round(p), 2)))
    return p;
}

function roundNumber(number, digits) {
    var multiple = Math.pow(10, digits);
    var rndedNum = Math.round(number * multiple) / multiple;
    return rndedNum;
}

function addToCart() {
    let form = getFormResults();
    let price = calculatePrice(unitary=true)
    let item_id = getItem();
    let customization = {
        'name':Items[item_id].name,
        'price': price,
        'image_src': Items[item_id].image_src};
    let quantity = Number(form['quantity'].value);

    for (id in form) {
        let ele = form[id];
        //console.log(ele, id)

        if (ele.id == 'quantity') {continue}

        if (ele.type == 'radio') {
            customization[ele.name] = ele.id;
        }
        else if (ele.type == 'checkbox') {
            customization[ele.name] = ele.checked;
        }
        else {
            customization[ele.name] = ele.value;
        }
    }
    //console.log(customization);
    updateCart(customization, quantity);
    console.log(localStorage.getItem('cart_list'));

    window.location.replace("./cart.html");
}

function updateCart(new_item, quantity) {
    new_item = JSON.stringify(new_item);

    let old_cookie = localStorage.getItem('cart_list');
    if (old_cookie != undefined) {
        let cart_list = JSON.parse(old_cookie);
        //console.log(cart_list);
        
        if (cart_list[new_item] === undefined) {
            cart_list[new_item] = {number:Number(quantity), id:getNextID()};
        }
        else {
            cart_list[new_item].number = Number(cart_list[new_item].number) + quantity;
        }
        let cookie = JSON.stringify(cart_list);
        localStorage.setItem('cart_list', cookie);
    }
    else {
        const new_cart = {};
        new_cart[new_item] = {number:Number(quantity), id:getNextID()};
        let cookie = JSON.stringify(new_cart);
        localStorage.setItem('cart_list', cookie);
    }
    
}

function getNextID() {
    let cart_cookie = localStorage.getItem('cart_list');

    if (cart_cookie != undefined) {
        const cart_list = JSON.parse(cart_cookie);
        let id_max = 0;
        for (let product of Object.values(cart_list)) {
            if (Number(product.id) > id_max) {
                id_max = Number(product.id);
            }
        }
        return id_max + 1;
    }
    else {
        return 0;
    }
}

// Canvas -------------------------------------------------------



function loadProductsImages() {
    loaded_bkg = false; 
    loaded_frgd = false;

    bkg_img = new Image();
    frgd_img = new Image();

    bkg_img.src = '../resources/products/' + Items[getItem()].image_src;
    frgd_img.src = '../resources/products/contours/' + Items[getItem()].contour_src;

    bkg_img.onload =  () => {
        loaded_bkg=true;
        drawImages();
    }

    frgd_img.onload = () => {
        loaded_frgd=true;
        drawImages();
    }
}

function loadTextures() {
    loaded_clay = false;
    loaded_wood = false;

    wood_texture = new Image();
    clay_texture = new Image();

    wood_texture.src = '../resources/textures/wood.jpg';
    clay_texture.src = '../resources/textures/clay.jpg';

    wood_texture.onload =  () => {
        loaded_wood=true;
        drawImages();
    }

    clay_texture.onload = () => {
        loaded_clay=true;
        drawImages();
    }

}




function drawImages() {
    if (loaded_bkg && loaded_frgd &&loaded_clay && loaded_wood) {
        let filters = getFormResults();
        //console.log(filters);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(bkg_img, 0.05*canvas.width, 0.05*canvas.height, 0.9*canvas.width, 0.9*canvas.height);

        context.fillStyle = filters['color'].value + '44';
        
        context.globalAlpha = 0.5;
        switch (filters['material'].id) {
            case ('wood'):
                context.drawImage(wood_texture, 0.05*canvas.width, 0.05*canvas.height, 0.9*canvas.width, 0.9*canvas.height);
                break;
            case ('clay'):
                context.drawImage(clay_texture, 0.05*canvas.width, 0.05*canvas.height, 0.9*canvas.width, 0.9*canvas.height);
                break;
        }
        context.globalAlpha = 1;

        context.fillRect(0.05*canvas.width, 0.05*canvas.height, 0.9*canvas.width, 0.9*canvas.height);
        context.drawImage(frgd_img, 0.05*canvas.width, 0.05*canvas.height, 0.9*canvas.width, 0.9*canvas.height);
    }
}


// ----------------------------------------------------------------------------------------------

console.log('-=[Page loaded]=-');

canvas = document.getElementById('canvas');
context = canvas.getContext('2d');

loadProducts();

