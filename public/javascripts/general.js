// creates a dissmissiable item and appends it to
function  dismissibleItem(el, type, value) {
   
   const symbol = document.createElement("div");
   const body = document.createElement("div");
   const button = document.createElement("div");
   const strong = document.createElement("strong");

   symbol.className = 'dismissible__symbol';
   body.className = 'dismissible__body';
   button.className = 'dismissible__button justify-end';
   
   strong.innerHTML = value;
   button.addEventListener('click', dismissBanner);
   body.appendChild(strong);

   el.className = `dismissible dismissible--${type}`;
   el.removeAttribute('data-component');
   el.removeAttribute('data-type');
   el.removeAttribute('data-value');
   el.append(symbol, body, button);

   return;
}

function dismissBanner(event) {
   this.parentNode.remove();
   return;
}

document.addEventListener('readystatechange', (event) => {
   if (document.readyState === "complete") {
      const dismissibles = document.querySelectorAll('[data-component="dismissible-item"]');
      if(dismissibles.length){
         for(let i = 0; i < dismissibles.length; i++) {
            const type = dismissibles[i].getAttribute('data-type'),
                  value = dismissibles[i].getAttribute('data-value');
            dismissibleItem(dismissibles[i], type, value);
         }
      }
   }
});