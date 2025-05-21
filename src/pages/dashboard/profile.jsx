import React, { Fragment, useState, useEffect } from "react";
import { Typography, Card, CardHeader, CardBody, Input, Button, CardFooter } from "@material-tailwind/react";
import { Dialog, Transition } from '@headlessui/react';
import Axios from "axios";
import Swal from 'sweetalert2';
import { PencilSquareIcon, EyeIcon, EyeSlashIcon, } from "@heroicons/react/24/solid";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { jwtDecode } from 'jwt-decode';
import Select from 'react-select';

export function Profile() {

  //funcion para las alertas
  function showAlert(icon = "success", title) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    Toast.fire({
      icon: icon,
      title: title
    });
  }

  //Listas
  const [usuariosList, setUsuariosL] = useState([]);

  //Variables
  const [usuario, setUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [celular, setCelular] = useState("");
  const [correo, setCorreo] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  //Variables para marcar errores en los input
  const [errorAll, setErrorAll] = useState(false);
  const [errorUsuario, setErrorUsuario] = useState(false);
  const [errorNombre, setErrorNombre] = useState(false);
  const [errorApellidos, setErrorApellidos] = useState(false);
  const [errorCelular, setErrorCelular] = useState(false);
  const [errorCorreo, setErrorCorreo] = useState(false);
  const [errorPass, setErrorPass] = useState(false);
  const [errorConfirmPass, setErrorConfirmPass] = useState(false);

  //Variables para editar
  const [id, setId] = useState(0);
  const [edit, setEdit] = useState(false);

  //Variable para el buscador

  const [user, setUser] = useState("");
  
  const [loading, setLoading] = useState(false);

  //Links de las API
  const URLUsuarios = "http://localhost:8080/api/usuarios";

  const getUsuarios = async () => {
    try {
      const resp = await Axios.get(URLUsuarios);
      setUsuariosL(resp.data.usuarios);
    } catch (error) {
      console.error("Error al obtener datos de los usuarios:", error);
    }
  };

  //Endpoint o métodos get
  const getUsuarioID = async () => {
    const token = localStorage.getItem('token');
    const decodedToken = jwtDecode(token);
    try {
      const resp = await Axios.get(URLUsuarios + `/${decodedToken.uid}`);
      setId(resp.data.usuario.IdUsuario);
      setUser(resp.data.usuario);
    } catch (error) {
      showAlert("error", "Error al obtener datos de los usuarios.");
      console.error("Error al obtener datos de los usuarios:", error);
    }
  };

  //Para cargar los get
  useEffect(() => {
    getUsuarios();
    getUsuarioID();
  }, []);

  //Endpoint o método put
  const putUsuario = () => {
    const valUsu = /^(?=.*[A-Z])[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.,/*-_=+]{3,20}$/;
    const valNomApe = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]{3,20}$/;
    const valCel = /^(?=.*\d)[0-9]{10}$/;
    const valEm = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.,/*-_=+]+@[a-zA-Z]{4,8}\.[a-zA-Z]{2,4}$/;
    const valPa = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.,/*-_=+]{8,30}$/;
    setErrorAll(false);
    setErrorUsuario(false);
    setErrorNombre(false);
    setErrorApellidos(false);
    setErrorCelular(false);
    setErrorCorreo(false);
    setErrorPass(false);
    setErrorConfirmPass(false);
    if (!usuario && !nombre && !apellidos && !celular && !correo && !pass && !confirmPass) {
      showAlert("error", "Complete primero los campos.");
      setErrorAll(true);
    } else if (!usuario) {
      showAlert("error", "Ingrese un nombre de usuario.");
      setErrorUsuario(true);
    } else if (!valUsu.test(usuario)) {
      showAlert("error", "Ingrese un nombre de usuario válido.");
      setErrorUsuario(true);
    } else if (usuariosList.map((user) => user.Usuario.toLowerCase()).includes(usuario.toLowerCase()) && usuario.toLowerCase() !== usuariosList.filter(user => user.IdUsuario == id).map(user => user.Usuario).toString().toLowerCase()) {
      showAlert("error", "Ese nombre de usuario ya está registrado...");
      setErrorUsuario(true);
    } else if (!nombre) {
      showAlert("error", "Ingrese su nombre.");
      setErrorNombre(true);
    } else if (!valNomApe.test(nombre)) {
      showAlert("error", "Ingrese un nombre válido.");
      setErrorNombre(true);
    } else if (!apellidos) {
      showAlert("error", "Ingrese sus apellidos.");
      setErrorApellidos(true);
    } else if (!valNomApe.test(apellidos)) {
      showAlert("error", "Ingrese apellidos válido.");
      setErrorApellidos(true);
    } else if (!celular) {
      showAlert("error", "Ingrese su número de celular.");
      setErrorCelular(true);
    } else if (!valCel.test(celular)) {
      showAlert("error", "Ingrese un número de celular válido.");
      setErrorCelular(true);
    } else if (usuariosList.map((user) => user.Celular).includes(celular) && celular.toString() !== usuariosList.filter(user => user.IdUsuario == id).map(user => user.Celular).toString()) {
      showAlert("error", "Ese número de celular ya está registrado...");
      setErrorCelular(true);
    } else if (!correo) {
      showAlert("error", "Ingrese un correo.");
      setErrorCorreo(true);
    } else if (!valEm.test(correo)) {
      showAlert("error", "Ingrese un correo válido.");
      setErrorCorreo(true);
    } else if (usuariosList.map((user) => user.Correo).includes(correo) && correo !== usuariosList.filter(user => user.IdUsuario == id).map(user => user.Correo).toString()) {
      showAlert("error", "Ese correo ya está registrado...");
      setErrorCorreo(true);
    } else if (!valPa.test(pass) && pass != "") {
      showAlert("error", "Ingrese una contraseña válida.");
      setErrorPass(true);
    } else if (confirmPass != pass) {
      showAlert("error", "Las contraseñas deben ser iguales.");
      setErrorPass(true);
      setErrorConfirmPass(true);
    } else {
      setLoading(true);
      Axios.put(URLUsuarios, {
        IdUsuario: id,
        IdRol: user.IdRol,
        Usuario: usuario,
        Estado: user.Estado,
        Nombre: nombre,
        Apellidos: apellidos,
        Celular: parseInt(celular),
        Correo: correo,
        Pass: pass,
      }).then(async () => {
        Empty();
        window.location.reload();
      })
        .catch((error) => {
          showAlert("error", "error al actualizar el usuario");
          console.error("Error al actualizar el usuario:", error);
        });
    }
  }

  //Variable y función para ver la contraseña
  const [ver, setVer] = useState(true);
  const toggleVer = () => {
    setVer(!ver)
  }

  //Función para vaciar las variables
  const Empty = async () => {
    setEdit(false);
    setVer(true);
    setUsuario("");
    setNombre("");
    setApellidos("");
    setCelular("");
    setCorreo("");
    setPass("");
    setConfirmPass("");
    setErrorAll(false);
    setErrorUsuario(false);
    setErrorNombre(false);
    setErrorApellidos(false);
    setErrorCelular(false);
    setErrorCorreo(false);
    setErrorPass(false);
    setErrorConfirmPass(false);
    await getUsuarios();
    setLoading(false);
  };

  function Editar() {
    setEdit(true);
    setUsuario(user.Usuario);
    setNombre(user.Nombre);
    setApellidos(user.Apellidos);
    setCelular(user.Celular);
    setCorreo(user.Correo);
  }

  function formatNumCel(number) {
    const fstSegment = number.substring(0, 3);
    const sndSegment = number.substring(3, 6);
    const trdSegment = number.substring(6, 10);
    const formatCel = `(${fstSegment}) ${sndSegment}-${trdSegment}`;
    return formatCel;
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {loading ? <div className="h-full w-full left-0 top-0 fixed z-50 grid content-center justify-center items-center bg-[rgba(0,0,0,0.3)] text-4xl"
        style={{ WebkitTextStroke: "1px white" }}><img src="/public/img/logo-login-black.png" alt="Cargando..." className="h-[300px]" /><span className="h-full flex justify-center pt-5 font-bold">Cargando...</span></div> : null}
      <Card>
        <CardHeader variant="gradient" className="mb-5 p-6 cardHeadCol">
          <Typography variant="h6" color="white" className="flex justify-between items-center">
            Perfil
            {!edit ? (
              <Button className="btnRed px-3 py-2 flex items-center border"
                onClick={() => { Editar() }}>
                <PencilSquareIcon className="h-6 w-6 me-2" />Modificar Información</Button>
            ) : (
              null
            )}
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-auto pt-3 pb-5">
          <div>
            {edit ? (
              <form
                onKeyDown={
                  (e) => {
                    if (e.key === "Enter" && e.target.nodeName !== 'TEXTAREA' && e.target.type !== 'submit') {
                      e.preventDefault();
                      putUsuario()
                    } else if (e.key === "Escape" && e.target.nodeName !== 'TEXTAREA') {
                      Empty()
                    }
                  }}>
                <div className="grid grid-cols-2 gap-3 me-5 ms-5">
                  <div className={`${errorUsuario || errorAll ? "divError" : ""} col-span-2`}>
                    <Input
                      className={`${errorUsuario || errorAll ? "error" : ""}`}
                      label="Usuario"
                      value={usuario}
                      onChange={(event) => setUsuario(event.target.value)} />
                    <span className={`${errorAll || errorUsuario ? "text-[rgb(255,0,0)]" : "text-gray-700 "} line-clamp-none text-left text-xs pl-1 mt-1`}>Debe tener de 3 a 20 caracteres y al menos una mayúscula.</span>
                  </div>
                  <div className={`${errorNombre || errorAll ? "divError" : ""} col-span-1`}>
                    <Input
                      className={`${errorNombre || errorAll ? "error" : ""}`}
                      label="Nombre"
                      value={nombre}
                      onChange={(event) => setNombre(event.target.value)} />
                  </div>
                  <div className={`${errorApellidos || errorAll ? "divError" : ""} col-span-1`}>
                    <Input
                      className={`${errorApellidos || errorAll ? "error" : ""}`}
                      label="Apellido"
                      value={apellidos}
                      onChange={(event) => setApellidos(event.target.value)} />
                  </div>
                  <div>
                    <div className={`${errorCelular || errorAll || celular.length > 10 ? "divError" : ""} flex items-center relative col-span-1`}>
                      <Input
                        className={`${errorCelular || errorAll || celular.length > 10 ? "error" : ""} pr-[60px]`}
                        label="Celular"
                        value={celular}
                        onChange={(event) => setCelular(event.target.value)}
                        type="number" />
                      <span className={`${errorCelular || errorAll || celular.length > 10 ? "text-[rgb(240,0,0)!important]" : ""} absolute right-3 text-black`}>{celular.length ? celular.length : "10"}/10</span>
                    </div>
                    <span className={`${errorAll || errorCelular ? "text-[rgb(255,0,0)]" : "text-gray-700 "} line-clamp-none text-left text-xs pl-1 mt-1`}>Debe ser un número de 10 dígitos.</span>
                  </div>
                  <div className={`${errorCorreo || errorAll ? "divError" : ""} col-span-1`}>
                    <Input
                      className={`${errorCorreo || errorAll ? "error" : ""}`}
                      label="Correo"
                      value={correo}
                      onChange={(event) => setCorreo(event.target.value)}
                      type="email" />
                    <span className={`${errorAll || errorCorreo ? "text-[rgb(255,0,0)]" : "text-gray-700 "} line-clamp-none text-left text-xs pl-1 mt-1`}>Ejemplo@gmail.com</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3 mx-5">
                  <div>
                    <div className={`${pass.length > 30 || errorPass || errorAll ? "divError" : ""} col-span-1 flex items-center relative`}>
                      <Input
                        className={`${pass.length > 99 ? "pr-[95px]" : "pr-[85px]"} ${pass.length > 30 || errorPass || errorAll ? "error" : ""}`}
                        label="Contraseña"
                        value={pass}
                        onChange={(event) => setPass(event.target.value)}
                        type={ver ? "password" : "text"} />
                      <span className={`${pass.length > 30 || errorPass || errorAll ? "text-[rgb(240,0,0)!important]" : ""} absolute right-10 text-black`}>{pass.length}/30</span>
                      <button
                        type="button"
                        className={`${errorAll || errorPass ? "error" : ""} ml-2 text-black absolute right-3 `}
                        onClick={toggleVer}>
                        {ver ? <EyeIcon className="h-5" /> : <EyeSlashIcon className="h-5" />}
                      </button>
                    </div>
                    <span className={`${errorAll || errorPass ? "text-[rgb(255,0,0)]" : "text-gray-700 "} line-clamp-none text-left text-xs pl-1 mt-1`}>Debe tener de 8 a 30 caracteres, al menos una mayúscula y un número.</span>
                  </div>
                  <div className={`${errorAll || errorConfirmPass ? "divError" : ""} col-span-1`}>
                    <Input
                      className={`${errorAll || errorConfirmPass ? "error" : ""}`}
                      label="Confirmar contraseña"
                      value={confirmPass}
                      onChange={(event) => setConfirmPass(event.target.value)}
                      type={ver ? "password" : "text"} />
                  </div>
                </div>{edit ? (
                  <div className="px-6 pt-3 flex justify-center gap-5">
                    <Button className="btnGreen px-3 py-2 flex items-center border"
                      onClick={() => { putUsuario(); }}>
                      <CheckIcon className="h-6 w-6 me-2" />Guardar</Button>
                    <Button className="btnRed px-3 py-2 flex items-center border"
                      onClick={() => { Empty(); }}>
                      <XMarkIcon className="h-6 w-6 me-2" />Cancelar</Button>
                  </div>
                ) : (null)}
              </form>
            ) : (
              <div>
                {user ?
                  <div key={user.Usuario} className="grid grid-cols-3 gap-3">
                    <p><strong>Usuario: </strong>{user.Usuario}</p>
                    <p><strong>Nombre: </strong>{user.Nombre}</p>
                    <p><strong>Apellido: </strong>{user.Apellidos}</p>
                    <p><strong>Celular: </strong>{formatNumCel(user.Celular.toString())}</p>
                    <p><strong>Correo: </strong>{user.Correo}</p>
                  </div>
                  :
                  <div key={user.Usuario} className="flex justify-center">
                    <p>Cargando...</p>
                  </div>
                }
              </div>
            )}
          </div>
        </CardBody>
      </Card >
    </div >
  );
}
export default Profile;