function getCartItems() {
    cart_list = JSON.parse(localStorage.getItem('cart_list'));
    return cart_list
}


function setCartItems(cart_list) {
    localStorage.setItem('cart_list', JSON.stringify(cart_list));
}


function over10Items(item_price, number) {
    let multiplier = (number >= 10) ? 0.90 : 1;
    let price = item_price * number * multiplier;

    price = roundNumber(price,2);

    let decimal_part = roundNumber(price - Math.round(price), 2);
    if (decimal_part != 0) {
        let decimal_digits = String(Math.abs(decimal_part)).length - 2;
        if (decimal_digits < 2) {
            price = price + '0'.repeat(2 - decimal_digits);
        }
    }
    else {
        price += '.00';
    }
    return price
}

function roundNumber(number, digits) {
    var multiple = Math.pow(10, digits);
    var rndedNum = Math.round(number * multiple) / multiple;
    return rndedNum;
}


function loadProducts() {
    fetch('../js/items.json')
    .then((res) => {return res.json()})
    .then((data) => {
        Items = data;
        addItems()
        //console.log(data);
    });
}

function addItems() {
    let template = document.getElementById('cart_item_template').innerHTML;
    let container = document.getElementById('cart-content');
    let items_price = document.getElementById('items_price');
    let total_price = document.getElementById('total_price');

    container.innerHTML = "";
    cart_list = getCartItems();
    //console.log(cart_list)
    if (Object.keys(cart_list).length === 0) {
        container.innerHTML = " Vous n'avez rien dans votre panier ";
        return
    }
    
    prixtot = 0;
    let item;
    let new_item;
    for (product in cart_list) {

        item = JSON.parse(product);
        //console.log(item)
        new_item = template
        .replace(/{{item-id}}/g, cart_list[product].id)
        .replace(/{{image_src}}/g, '../resources/products/' + item.image_src)
        .replace(/{{name}}/g, item.name)
        .replace(/{{quantity}}/g, cart_list[product].number)
        .replace(/{{price}}/g, over10Items(item.price, cart_list[product].number))
        .replace(/{{options}}/g, formalizeOptions(item));

        prixtot = prixtot + Number(over10Items(item.price, cart_list[product].number));
        
        container.innerHTML = container.innerHTML + new_item;
    }
    items_price.innerHTML = "Commande: " + Number(prixtot) + "€";
    total_price.innerHTML = "Prix total: " + Number(prixtot) + "€"; 

}

function formalizeOptions(item) {
    let outstr = "<h4><u> Options: </u></h4>";
    translation = {
        "ceramic":"Céramique",
        "clay":"Argile",
        "wood":"Bois"
    }
    outstr += strWithTags('Couleur: '+item.color, '<h4>');
    outstr += strWithTags('Matériau: '+ translation[item.material], '<h4>');
    outstr += strWithTags('Cadeau: ' + ((item.gift) ? 'Oui': 'Non'), '<h4>');
    //console.log(outstr);
    return outstr
}

function strWithTags(str, tag) {
    return tag + str + '</' + tag.slice(2)
}


function addOne(id) {
    const item_number = document.querySelector(`#item-${id} #item-number`);
    cart_list[getItemFromID(id)].number += 1;
    item_number.innerHTML = cart_list[getItemFromID(id)].number;
    setCartItems(cart_list);
    addItems();
}

function removeOne(id) {
    const item_number_display = document.querySelector(`#item-${id} #item-number`);
    let item_number = cart_list[getItemFromID(id)].number;
    if (item_number > 1) {
        cart_list[getItemFromID(id)].number = item_number - 1;
        item_number_display.innerHTML = cart_list[getItemFromID(id)].number;
    }
    else if (item_number === 1){
        removeItem(id);
    }
    setCartItems(cart_list);
    addItems();
}

function removeItem(id) {
    let item = document.getElementById(`item-${id}`);
    item.parentNode.removeChild(item);
    delete cart_list[getItemFromID(id)];
    setCartItems(cart_list);
    addItems();
}

function getItemFromID(id) {
    for (let product in cart_list) {
        if (id === Number(cart_list[product].id)) {
            return product
        }
    }
    return undefined
}

function geocod(prixtot) {
    let ville = document.getElementById("adresse").value;
    //console.log("geocode",ville,ville.trim().length)
    if (ville.trim().length == 0) {
        addDistance(-1, prixtot);
    }
    else {
        fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${ville}.json?access_token=pk.eyJ1Ijoic2ViMTIwMSIsImEiOiJja3ZjMWJheWQwaGI5MnVxbjY0NHdqMGNwIn0.cjn8lNKqfwXGemuNv160uQ`,
            { method: 'GET' })
            .then(data => data.json())
            .then( json => {
                const x = json.features[0].center[0];
                const y = json.features[0].center[1];
                //console.log(x,y)
                fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/45.761071,4.853570;${y},${x}?steps=true&geometries=geojson&access_token=pk.eyJ1Ijoic2ViMTIwMSIsImEiOiJja3YxejV3eXMxb2lqMnVxdzJ2bnlyanZxIn0.ySy7y7Sd28J_2bmKGVt3CQ`,
                { method: 'GET' })
                .then(data2 => data2.json())
                .then( json2 => {
                    //console.log(json2)
                    let d=json2.routes[0].distance; //pour avoir la distance : json2.routes[0].distance
                    let distance = Math.round(d)/1000;
                    addDistance(distance, prixtot);})
                .catch( error => {console.log(error);addDistance(-1, prixtot)})
                .catch( error => {console.log(error);addDistance(-1, prixtot)})})
            .catch( error => {console.log(error);addDistance(-1, prixtot)})
            .catch( error => {console.log(error);addDistance(-1, prixtot)})
        
        
    }
}

function addDistance(distance, prixtot) {
    let new_tot_price = document.getElementById('total_price');
    let delivery_price = document.getElementById('delivery_price');
    console.log('Distance calculée', distance)
    //console.log(prixtot)

    if (distance == -1) {
        document.getElementById("adresse").style.border = "2px solid red"
        document.getElementById('buy').style.backgroundColor = "rgb(160, 0, 0)";
        return
    }
    else {
        document.getElementById("adresse").style.border = "2px solid green";

        if (distance<20){
            new_tot_price.innerHTML = "Prix total : " + Math.round(Number(prixtot)*100)/100 + "€";
            delivery_price.innerHTML = "Livraison: Gratuit"
        }
        else{
            delivery_price.innerHTML = "Livraison: " + Math.round(Number(5+0.07*distance)*100)/100 + "€";
            new_tot_price.innerHTML = "Prix total : " + Math.round(Number(prixtot +5+0.07*distance)*100)/100 + "€";
        }

        document.getElementById('buy').style.backgroundColor = "rgb(0, 160, 0)";
    }

    
}

function checkForm() {

    let unix_current_date = Math.round(new Date().getTime() / 1000);

    const email_check = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const name_check = /^[a-zA-Z-' ]*$/
    const tel_check = /^[0-9]{10}/;

    const form = document.forms[0]

    let green = "2px green solid";
    let red = "2px red solid";

    let firstname_cond = name_check.test(form.firstname.value) && (form.firstname.value.trim() != 0);
    form.firstname.style.border = (firstname_cond) ? green : red;

    let lastname_cond = name_check.test(form.lastname.value) && (form.lastname.value.trim() != 0);
    form.lastname.style.border = (lastname_cond) ? green : red;

    let email_cond = email_check.test(form.email.value) && (form.email.value.trim() != 0);
    form.email.style.border = (email_cond) ? green : red;

    let tel_cond = tel_check.test(form.phone.value);
    form.phone.style.border = (tel_cond) ? green : red;

    let date_cond = (unix_current_date < Date.parse(form.date.value)/1000);
    form.date.style.border = (date_cond) ? green : red;


    if (firstname_cond && lastname_cond && email_cond && date_cond && tel_cond) {
        geocod(prixtot)
    }
}



//---------------------------------
console.log('Loading cart...')
loadProducts();