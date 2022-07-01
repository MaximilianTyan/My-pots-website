function loadHeaderTemplate() {
    fetch('./templates/header.html')
    .then(res => res.blob())
    .then(data => data.text())
    .then(html => {
      addElement(html,'header');
    })
}

function loadFooterTemplate() {
    fetch('./templates/footer.html')
    .then(res => res.blob())
    .then(data => data.text())
    .then(html => {
        template = html;
        //console.log(template);
        addElement(template,'footer');
        
        button = document.getElementById("scrollUp");
        window.onscroll = function() {scrollFunction()};
    })
}

function addElement(html, type) {
    container = document.getElementsByTagName(String(type))[0];
    //console.log('before', container);
    container.innerHTML = html.replace(/{{page}}/g, container.innerHTML);
    //console.log('after', container);
    console.log(`Template: ${type} added`);
}

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      button.style.display = "block";
    } else {
      button.style.display = "none";
    }
  }
  
  function topFunction() {
    document.body.scrollTop = 0; 
    document.documentElement.scrollTop = 0; 
  }

//---------------------------------------------


template = undefined;
loadFooterTemplate();
loadHeaderTemplate();
