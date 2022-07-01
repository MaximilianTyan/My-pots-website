function loadProducts() {
  fetch('../js/items.json')
    .then((res) => res.json())
    .then((data) => {
      Items = data;
      console.log('filters initiated')
    })
}

function resetFilters() {
  document.getElementById('form').reset();
  updateFilters();
}


function updateFilters() {

  // Radio buttons check
  const radioFilters = getRadioFiltersValue();
  let priceMin = document.getElementById('pricemin').value;
  let priceMax = document.getElementById('pricemax').value;
  let forme = document.getElementById('forme').value

  for (id in Items) {
    let shown = true;
    for (let filterId in radioFilters) {
      if (shown) {
        shown = (shown && (Items[id].filters[filterId] === radioFilters[filterId]));
        //console.log('check', Items[id].filters[filterId], filters[filterId])
      }
      else {
        break;
      }
    }

    shown &= (priceMin <= Items[id].price) && (Items[id].price <= priceMax)
    
    if (forme != "all") {
      shown &= (Items[id].filters['shape'] === forme);
    }
    

    //Hide elements
    card = document.getElementById('item-' + id);
    card.hidden = (!shown);
  }
}

function getRadioFiltersValue() {
  const filterValues = {};
  var radios = document.getElementsByTagName('input');
  for (id in radios) {
    if (radios[id].type == 'radio' && radios[id].checked) {
      filterValues[radios[id].name] = radios[id].id;
    }
  }
  return filterValues
}


//-------------------------------------------------------
var Items;
console.log('initiating filters')
loadProducts();
