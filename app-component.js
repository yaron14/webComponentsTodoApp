(function() {
  const currentDocument = document.currentScript.ownerDocument;

  class TodoList extends HTMLElement {
    constructor() {
      super();
      const shadowRoot = this.attachShadow({
        mode: "open"
      });
      const template = currentDocument.querySelector("#todo-list-tmplt");
      const instance = template.content.cloneNode(true);
      shadowRoot.appendChild(instance);
      shadowRoot.getElementById("todo-form").onsubmit = this.render.bind(this);
      this.shadowRoot.addEventListener("click", this.removeItem.bind(this));
      this.shadowRoot.getElementById("remove-all").onclick = () => this.proxy.todo.splice(0) && this.setAttribute("values", "");
      this.proxyfy();
    }

    proxyfy() {
      this.todosHandler = {
        get: (obj, prop) => {
          return obj[prop];
        },
        set: (obj, prop, value) => {
          obj[prop] = value;
          if (value) {
            this.shadowRoot.getElementById("todos").innerHTML = Mustache.render(mustacheTemplate(), {
              todoItem: value
            });
          }
          return true;
        }
      };
      this.proxy = new Proxy({}, this.todosHandler);
    }

    connectedCallback() {
      console.log("connected");
    }

    static get observedAttributes() {
      return ["values"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      console.log("Custom element attributes changed.");
      let val = newValue.split(", ");
      if (!newValue) {
        val = null;
      }
      this.proxy.todo = !val
        ? []
        : val.map((val, i) => ({
            todo: val,
            counter: i
          }));
    }

    render(e) {
      e.preventDefault();
      if (!e.target.elements["todo-input"].value) {
        alert("Please add a todo!");
        return;
      }
      const values = this.getAttribute("values");
      this.setAttribute("values", values ? values + `, ${e.target.elements["todo-input"].value}` : e.target.elements["todo-input"].value);
      e.target.elements["todo-input"].value = "";
    }

    removeItem(e) {
      if (!e.target.dataset.todo) {
        return;
      }
      const todoIndex = this.proxy.todo.indexOf(this.proxy.todo.filter(rec => rec.counter == e.target.dataset.todo)[0]);
      this.proxy.todo.splice(todoIndex, 1);
      this.setAttribute("values", this.proxy.todo.map(rec => rec.todo).join(", "));
    }
  }

  function mustacheTemplate() {
    const tmplt = `{{#todoItem}}
      <div id="{{counter}}">
        <div draggable="true">
          {{todo}}
          <span data-todo="{{counter}}">X</span>
        </div>
      </div>
      {{/todoItem}}`;
    return tmplt;
  }

  customElements.define("todo-list", TodoList);
})();
