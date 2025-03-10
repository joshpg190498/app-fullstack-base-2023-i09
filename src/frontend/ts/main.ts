var API_URL: string = "http://192.168.56.101:8000"

var M;
var createForm = true // create= true, update = false
var deviceId = undefined
class Main implements EventListenerObject{
    public usuarios: Array<Usuario>= new Array<Usuario>();
  

    private buscarPersonas() {

   
        for (let u of this.usuarios) {
            console.log(u.mostrar(),this.usuarios.length);
        }
    }
    
    // función para traer dispositivos
    public buscarDevices() {
        
        let xmlRequest = new XMLHttpRequest();
        
        xmlRequest.onreadystatechange = () => {
     
            if (xmlRequest.readyState == 4) {
                if(xmlRequest.status==200){
                    let respuesta = xmlRequest.responseText;
                    let datos:Array<Device> = JSON.parse(respuesta);
                    
                    let ul = document.getElementById("listaDisp"); 
                    ul.innerHTML = "";
                    for (let d of datos) {
                        let itemList =` 
                        <li class="collection-item custom-item">
                            <div class="row">
                                <div class="col s2 collection-item avatar">
                                    <i class="material-icons circle">${d.icon}</i>
                                </div>
                                <div class="col s5">
                                <span class="title custom-title">${d.name}</span>
                                <p>${d.description}</p>
                                </div>
                                <div class="col">
                                    <a class="secondary-content">
                                        <i class="material-icons custom-icon clickable" nuevoAtt="${d.id}" id="edit_${d.id}">edit</i>
                                        <i class="material-icons custom-icon clickable" nuevoAtt="${d.id}" id="delete_${d.id}">delete</i>
                                    </a>
                                </div>
                               
                            </div>
                            <div class="row">

                                <div class="col s12">`
                                if (d.type == 0) {
                                    itemList +=`<div class="switch">
                                        <label>
                                            Off
                                            <input type="checkbox"`;
                                            itemList +=`nuevoAtt="${d.id}"  id="cb_${d.id}"`
                                            if (d.state) {
                                                itemList+= ` checked `
                                            }
                                            itemList+= `>
                                            <span class="lever"></span>
                                            On
                                        </label>
                                    </div>`
                                }
                                if (d.type == 1) {
                                    itemList += `<p class="range-field">
                                        <input type="range" nuevoAtt="${d.id}" id="rg_${d.id}" min="0" max="100" value="${d.value * 100}"/>
                                        <span id="valorRango_${d.id}">${d.value * 100}</span>
                                    </p>`
                                }
                                itemList += `</div>
                            </div>
                        </li>`
                        ul.innerHTML += itemList;
                    }

                    for (let d of datos) {

                        if (d.type == 0) {

                            let checkbox = document.getElementById("cb_" + d.id)

                            checkbox.addEventListener("click", (event: any): void => {
                                const checkbox = event.target
                                const deviceId = checkbox.getAttribute('nuevoatt')
                                const newState = checkbox.checked
                        
                                let body = {
                                    id: deviceId,
                                    state: newState
                                }
                                this.actualizarEstado(body)
                            })
                        }

                        if (d.type == 1) {
                            let rangeInput = document.getElementById("rg_" + d.id)
                            let valorSpan = document.getElementById(`valorRango_${d.id}`);
                            rangeInput.addEventListener("input", (event) => {
                                valorSpan.textContent = rangeInput.value
                            })
                            rangeInput.addEventListener("change", (event) => {
                                const deviceId = rangeInput.getAttribute('nuevoAtt')
                                const newValue = rangeInput.value
                        
                                let body = {
                                    id: deviceId,
                                    value: Number(newValue) / 100;
                                }
                                this.actualizarValorEnBaseDeDatos(body)
                            })
                        }

                        let deleteBtn = document.getElementById("delete_" + d.id)
                        deleteBtn.addEventListener("click", (event: any): void => {
                            const deviceId = Number(deleteBtn.getAttribute('nuevoatt'))
                            this.eliminarDispositivo(deviceId)
                        })

                        let editBtn = document.getElementById("edit_" + d.id)
                        editBtn.addEventListener("click", (event: any): void => {
                            const deviceId = Number(deleteBtn.getAttribute('nuevoatt'))
                            this.handleUpdateModal(deviceId)
                        })
                    }

                } else{
                    console.log("no encontre nada");
                }
            }
            
        }
        xmlRequest.open("GET",`${API_URL}/devices`,true)
        xmlRequest.send();
    }

    private cargarUsuario(): void{
        let iNombre = <HTMLInputElement>document.getElementById("iNombre");
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

    // función para obtener iconos - comunicación con backend
    public cargarIconos(): void {
        let xmlRequest = new XMLHttpRequest();

        xmlRequest.onreadystatechange = () => {
            if (xmlRequest.readyState == 4) {
                if (xmlRequest.status == 200) {
                    let respuesta = xmlRequest.responseText;
                    let items: Array<Icono> = JSON.parse(respuesta);

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

    // definición de formulario
    private formulario: DatosFormulario = {
        nombre: "",
        descripcion: "",
        tipoDispositivo: 0,
        icono: 0
    }

    // función para crear formulario
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

        if (Number(iconoSeleccionado) === 0) {
            alert("Por favor, seleccione algún ícono.")
            return
        }

        this.formulario.nombre = iNombre.value
        this.formulario.descripcion = iDescripcion.value
        this.formulario.tipoDispositivo = Number(iTipoDispositivo.value)
        this.formulario.icono = iconoSeleccionado

        return this.formulario
    }

    // función para crear dispositivo
    public crearDispositivo(formulario: DatosFormulario): void {
        let xmlRequest = new XMLHttpRequest()

        xmlRequest.onreadystatechange = () => {
            if (xmlRequest.readyState == 4) {
                if (xmlRequest.status == 200) {
                    let respuesta: any = xmlRequest.responseText
                    let jsonRespuesta = JSON.parse(respuesta)
                    this.limpiarFormulario()
                    alert(jsonRespuesta.mensaje)
                    this.buscarDevices()
                } else {
                    let respuestaError: any = xmlRequest.responseText
                    let jsonRespuestaError = JSON.parse(respuestaError)
                    console.log(jsonRespuestaError.mensaje)
                    //alert(jsonRespuestaError.mensaje)
                }
            }
        }
        xmlRequest.open("POST", `${API_URL}/devices`, true)
        xmlRequest.setRequestHeader("Content-Type", "application/json")
        xmlRequest.send(JSON.stringify(formulario))
    }   

    // función para actualizar estado de dispositivo
    private actualizarEstado(body: any): void {
        let xmlRequest = new XMLHttpRequest();

        xmlRequest.onreadystatechange = () => {
            if (xmlRequest.readyState == 4) {
                if (xmlRequest.status == 200) {
                    let respuesta: any = xmlRequest.responseText
                    let jsonRespuesta = JSON.parse(respuesta)
                    //alert(jsonRespuesta.mensaje)
                } else {
                    let respuestaError: any = xmlRequest.responseText
                    let jsonRespuestaError = JSON.parse(respuestaError)
                    console.log(jsonRespuestaError.mensaje)
                    //alert(jsonRespuestaError.mensaje)
                }
            }
        }
        
        xmlRequest.open("PUT", `${API_URL}/devices/state`, true)
        xmlRequest.setRequestHeader("Content-Type", "application/json");
        xmlRequest.send(JSON.stringify(body))
    }

    // función para actualizar valor de dispositivo
    private actualizarValorEnBaseDeDatos(body: any): void {

        let xmlRequest = new XMLHttpRequest()
    
        xmlRequest.onreadystatechange = () => {
            if (xmlRequest.readyState == 4) {
                if (xmlRequest.status == 200) {
                    let respuesta: any = xmlRequest.responseText
                    let jsonRespuesta = JSON.parse(respuesta)
                } else {
                    let respuestaError: any = xmlRequest.responseText
                    let jsonRespuestaError = JSON.parse(respuestaError)
                    console.log(jsonRespuestaError.mensaje)
                }
            }
        }
    
        xmlRequest.open("PUT", `${API_URL}/devices/value`, true)
        xmlRequest.setRequestHeader("Content-Type", "application/json")
        xmlRequest.send(JSON.stringify(body))
    }

    // función para limpiar formulario al guardar o cancelar
    public limpiarFormulario(): void {
        const iNombre = <HTMLInputElement>document.getElementById("iNombre")
        const iDescripcion = <HTMLInputElement>document.getElementById("iDescripcion")
        const iTipoDispositivo = <HTMLSelectElement>document.getElementById("iTipoDispositivo")
        const iIconoRadios = document.getElementsByName("iIcono")

        iNombre.value = ""
        iDescripcion.value = ""
        iTipoDispositivo.value = "null"
        for (let i = 0; i < iIconoRadios.length; i++) {
            const radio = iIconoRadios[i] as HTMLInputElement;
            radio.checked = false;
        }
        M.FormSelect.init(iTipoDispositivo)
    }

    // función para eliminar dispositivo - comunicación con backend
    private eliminarDispositivo(deviceId: number): void {
        let xmlRequest = new XMLHttpRequest();

        xmlRequest.onreadystatechange = () => {
            if (xmlRequest.readyState == 4) {
                if (xmlRequest.status == 200) {
                    let respuesta: any = xmlRequest.responseText
                    let jsonRespuesta = JSON.parse(respuesta)
                    this.buscarDevices()
                    alert(jsonRespuesta.mensaje)
                } else {
                    let respuestaError: any = xmlRequest.responseText
                    let jsonRespuestaError = JSON.parse(respuestaError)
                    console.log(jsonRespuestaError.mensaje)
                }
            }
        }
        
        xmlRequest.open("DELETE", `${API_URL}/devices/${deviceId}`, true)
        xmlRequest.setRequestHeader("Content-Type", "application/json");
        xmlRequest.send()
    }

    // manejador para actualizar dispositivo
    private handleUpdateModal(deviceId: number): void {
        let xmlRequest = new XMLHttpRequest();

        xmlRequest.onreadystatechange = () => {
            if (xmlRequest.readyState == 4) {
                if (xmlRequest.status == 200) {
                    let respuesta: any = xmlRequest.responseText
                    let jsonRespuesta = JSON.parse(respuesta)
                    this.actualizarFormulario(jsonRespuesta.data)
                    //this.buscarDevices()
                    //alert(jsonRespuesta.mensaje)
                } else {
                    let respuestaError: any = xmlRequest.responseText
                    let jsonRespuestaError = JSON.parse(respuestaError)
                    console.log(jsonRespuestaError.mensaje)
                }
            }
        }
        
        xmlRequest.open("GET", `${API_URL}/devices/${deviceId}`, true)
        xmlRequest.setRequestHeader("Content-Type", "application/json");
        xmlRequest.send()    
    }

    // función para actualizar formulario al editar dispositivo
    private actualizarFormulario(data: any): void {
        createForm = false
        deviceId = data.id
        this.openModal()
        this.llenarFormularioActualizar(data)
    }

    // función para llenar formulario en actualización
    private llenarFormularioActualizar(data: any): void {
        const iNombre = <HTMLInputElement>document.getElementById("iNombre")
        const iDescripcion = <HTMLInputElement>document.getElementById("iDescripcion")
        const iTipoDispositivo = <HTMLSelectElement>document.getElementById("iTipoDispositivo")
        const iIconoRadios = document.getElementsByName("iIcono")

        iNombre.value =  data.name
        iDescripcion.value = data.description
        iTipoDispositivo.value = data.type

        for (let i = 0; i < iIconoRadios.length; i++) {
            const radio = iIconoRadios[i] as HTMLInputElement;
            
            if (Number(radio.value) == data.iconId) {
                radio.checked = true;
                break; 
            }
        }
        M.updateTextFields()
        M.FormSelect.init(iTipoDispositivo)
    }

    // función para editar dispositivo - comunicación con backend
    public editarDispositivo(formulario: DatosFormulario): void {
        let xmlRequest = new XMLHttpRequest()

        xmlRequest.onreadystatechange = () => {
            if (xmlRequest.readyState == 4) {
                if (xmlRequest.status == 200) {
                    let respuesta: any = xmlRequest.responseText
                    let jsonRespuesta = JSON.parse(respuesta)
                    this.limpiarFormulario()
                    alert(jsonRespuesta.mensaje)
                    this.buscarDevices()
                } else {
                    let respuestaError: any = xmlRequest.responseText
                    let jsonRespuestaError = JSON.parse(respuestaError)
                    console.log(jsonRespuestaError.mensaje)
                    //alert(jsonRespuestaError.mensaje)
                }
            }
        }
        xmlRequest.open("PUT", `${API_URL}/devices/${deviceId}`, true)
        xmlRequest.setRequestHeader("Content-Type", "application/json")
        xmlRequest.send(JSON.stringify(formulario))
    }  

    // modal functions: abrir y cerrar
    public openModal(): void {
        let modalInstance = M.Modal.getInstance(document.getElementById("modal1"));
        modalInstance.open();
    }
    
    public closeModal(): void {
        let modalInstance = M.Modal.getInstance(document.getElementById("modal1"))
        modalInstance.close()
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

    // evento botón guardar en modal
    let btnGuardar = document.getElementById("btnGuardar");
    btnGuardar.addEventListener("click", handleOnClickBtnGuardar);

    //let checkbox = document.getElementById("cb");
    //checkbox.addEventListener("click", main1);

    // evento botón agregar dispositivo
    let btnAbrirModal = document.getElementById("btnAbrirModal");
    btnAbrirModal.addEventListener("click", handleOnClickBtnAbrirModal);
    
    // evento botón cancelar en modal
    let btnCancelar = document.getElementById("btnCancelar");
    btnCancelar.addEventListener("click", handleOnClickBtnCancelar);

    // cargar iconos de modal
    main1.cargarIconos()

    //handlers -------------//

    // manejador botón de agregar dispositivo
    function handleOnClickBtnAbrirModal(): void {
        createForm = true
        deviceId = undefined
        console.log('handle btnAbrirModal')
        main1.openModal()
    }
    
    // manejador botón de cancelar en modal
    function handleOnClickBtnCancelar(): void {
        console.log('handle btnCancelar')
        main1.limpiarFormulario()
        main1.closeModal()
    }
    
    //manejador botón de guardar en modal
    function handleOnClickBtnGuardar(): void {
        let formulario = main1.crearFormulario()
        if(createForm && !deviceId) {
            main1.crearDispositivo(formulario)
        }

        if(!createForm && deviceId) {
            main1.editarDispositivo(formulario)
        }
        main1.closeModal()    
    }
});




