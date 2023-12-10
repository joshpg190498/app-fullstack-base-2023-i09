var API_URL: string = "http://192.168.56.101:8000"

var M;
class Main implements EventListenerObject{
    public usuarios: Array<Usuario>= new Array<Usuario>();
  

    private buscarPersonas() {

   
        for (let u of this.usuarios) {
            console.log(u.mostrar(),this.usuarios.length);
        }
    }
    
    public buscarDevices() {
        
        let xmlRequest = new XMLHttpRequest();
        
        xmlRequest.onreadystatechange = () => {
     
            if (xmlRequest.readyState == 4) {
                if(xmlRequest.status==200){
                    console.log(xmlRequest.responseText, xmlRequest.readyState);    
                    let respuesta = xmlRequest.responseText;
                    let datos:Array<Device> = JSON.parse(respuesta);
                    
                    let ul = document.getElementById("listaDisp"); 

                    for (let d of datos) {
                        let itemList =
                            ` <li class="collection-item avatar">
                        <span>  
                            <i class="material-icons">${d.icon}</i>
                        </span>
                        <span class="title">${d.name}</span>
                        <p>
                         ${d.description}
                        </p>
                        <a href="#!" class="secondary-content">
                        <div class="switch">
                        <label>
                          Off
                          <input type="checkbox"`;
                          itemList +=`nuevoAtt="${d.id}" id="cb_${d.id}"`
                        if (d.state) {
                            itemList+= ` checked `
                        }
                        
                        itemList+= `>
                          <span class="lever"></span>
                          On
                        </label>
                      </div>
                        </a>
                      </li>`
                       
                        ul.innerHTML += itemList;

                    }
                    for (let d of datos) {
                        let checkbox = document.getElementById("cb_" + d.id);

                        checkbox.addEventListener("click", this);
                    }

                }else{
                    console.log("no encontre nada");
                }
            }
            
        }
        xmlRequest.open("GET",`${API_URL}/devices`,true)
        xmlRequest.send();
    }

    private ejecutarPost(id:number,state:boolean) {
        let xmlRequest = new XMLHttpRequest();

        xmlRequest.onreadystatechange = () => {
            if (xmlRequest.readyState == 4) {
                if (xmlRequest.status == 200) {
                    console.log("llego resputa",xmlRequest.responseText);        
                } else {
                    alert("Salio mal la consulta");
                }
            }
            
            

        }
        
       
        xmlRequest.open("POST", `${API_URL}/device`, true)
        xmlRequest.setRequestHeader("Content-Type", "application/json");
        let s = {
            id: id,
            state: state   };
        xmlRequest.send(JSON.stringify(s));
    }

    private cargarUsuario(): void{
        let iNombre =<HTMLInputElement> document.getElementById("iNombre");
        let iPassword = <HTMLInputElement>document.getElementById("iPassword");
        let pInfo = document.getElementById("pInfo");
        if (iNombre.value.length > 3 && iPassword.value.length > 3) {
            let usuari1: Usuario = new Usuario(iNombre.value, "user", iPassword.value,23);
            this.usuarios.push(usuari1);
            iNombre.value = "";
            iPassword.value = "";
           
            
            pInfo.innerHTML = "Se cargo correctamente!";
            pInfo.className ="textoCorrecto";
            
        } else {
            pInfo.innerHTML = "Usuairo o contraseña incorrecta!!!";
            pInfo.className ="textoError";
        }
        
        
    }

    public cargarIconos(): void {
        let xmlRequest = new XMLHttpRequest();

        xmlRequest.onreadystatechange = () => {
            if (xmlRequest.readyState == 4) {
                if (xmlRequest.status == 200) {
                    let respuesta = xmlRequest.responseText;
                    let items: Array<Icono> = JSON.parse(respuesta);
                    console.log("llego resputa",items);        

                    // Limpia el contenedor antes de agregar nuevos radios
                    let contenedorIconos = document.getElementById("iIconoContenedor");
                    contenedorIconos.innerHTML = ""
                    // Genera radios para cada ícono
                    for (let item of items) {
                        let radio =
                            `<div class="input-field col s4">
                                <p>
                                    <label>
                                        <input name="iIcono" type="radio" value="${item.id}" />
                                        <span>
                                            <i class="material-icons">${item.icon}</i>
                                        </span>
                                    </label>
                                </p>
                            </div>`;
                        contenedorIconos.innerHTML += radio;
                    }
                }
            }
        };

        xmlRequest.open("GET", `${API_URL}/icons`, true);
        xmlRequest.send();
    }

    private formulario: DatosFormulario = {
        nombre: "",
        descripcion: "",
        tipoDispositivo: 0,
        icono: 0
    }

    public crearFormulario(): DatosFormulario {
        const iNombre = <HTMLInputElement>document.getElementById("iNombre");
        const iDescripcion = <HTMLInputElement>document.getElementById("iDescripcion");
        const iTipoDispositivo = <HTMLSelectElement>document.getElementById("iTipoDispositivo");
        const iIconoRadios = document.getElementsByName("iIcono");

        if (iNombre.value.trim() === "") {
            alert("Por favor, ingrese nombre del dispositivo.");
            return
        }

        if (iDescripcion.value.trim() === "") {
            alert("Por favor, ingrese descripción del dispositivo.")
            return
        }

        let iconoSeleccionado = 0

        for (let i = 0; i < iIconoRadios.length; i++) {
            const radio = iIconoRadios[i] as HTMLInputElement;
        
            if (radio.checked) {
                iconoSeleccionado = Number(radio.value);
                break; 
            }
        }

        if (iTipoDispositivo.value.trim() === "null") {
            return
        }

        console.log(iconoSeleccionado, 'que fue')

        if (Number(iconoSeleccionado) === 0) {
            alert("Por favor, seleccione algún ícono.")
            return
        }

        this.formulario.nombre = iNombre.value
        this.formulario.descripcion = iDescripcion.value
        this.formulario.tipoDispositivo = Number(iTipoDispositivo.value)
        this.formulario.icono = iconoSeleccionado

        console.log(this.formulario, 'sauu')
        return this.formulario
    }
}

    
window.addEventListener("load", () => {

    var elems = document.querySelectorAll('select');
    M.FormSelect.init(elems, "");
    var elemsModal = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elemsModal, "");

    let main1: Main = new Main();

    main1.buscarDevices();

    //let boton = document.getElementById("btnListar");
    
    //boton.addEventListener("click", main1);   

    let btnGuardar = document.getElementById("btnGuardar");
    btnGuardar.addEventListener("click", handleOnClickBtnGuardar);

    //let checkbox = document.getElementById("cb");
    //checkbox.addEventListener("click", main1);

    let btnAbrirModal = document.getElementById("btnAbrirModal");
    btnAbrirModal.addEventListener("click", handleOnClickBtnAbrirModal);
    
    let btnCancelar = document.getElementById("btnCancelar");
    btnCancelar.addEventListener("click", handleOnClickBtnCancelar);

    // handle functions

    function handleOnClickBtnAbrirModal(): void {
        console.log('handle btnAbrirModal')
        openModal()
        main1.cargarIconos()
    }
    
    function handleOnClickBtnCancelar(): void {
        console.log('handle btnCancelar')
        closeModal()
    }
    
    function handleOnClickBtnGuardar(): void {
        let hola = main1.crearFormulario()
        
        console.log('handle BtnGuardar', hola)
        //closeModal()
    }

    // modal functions

    function openModal(): void {
        let modalInstance = M.Modal.getInstance(document.getElementById("modal1"));
        modalInstance.open();
    }
    
    function closeModal(): void {
        let modalInstance = M.Modal.getInstance(document.getElementById("modal1"))
        modalInstance.close()
    }

});




