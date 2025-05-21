import { Card, Input, Checkbox, Button, Typography } from "@material-tailwind/react";
import { Link } from "react-router-dom";
import React, { Fragment, useState, useEffect } from "react";
import Axios from "axios";
import Swal from 'sweetalert2';
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useNavigate } from 'react-router-dom';

export function SignUp() {

  function showAlert(icon = "success", title, timer = 1500) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: timer,
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

  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [celular, setCelular] = useState("");
  const [correo, setCorreo] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [errorAll, setErrorAll] = useState(false);
  const [errorUsuario, setErrorUsuario] = useState(false);
  const [errorNombre, setErrorNombre] = useState(false);
  const [errorApellidos, setErrorApellidos] = useState(false);
  const [errorCelular, setErrorCelular] = useState(false);
  const [errorCorreo, setErrorCorreo] = useState(false);
  const [errorPass, setErrorPass] = useState(false);
  const [errorConfirmPass, setErrorConfirmPass] = useState(false);

  const [usuariosList, setUsuariosL] = useState([]);

  const [loading, setLoading] = useState(false);

  const URLUsuarios = "http://localhost:8080/api/usuarios";

  const getUsuarios = async () => {
    try {
      const resp = await Axios.get(URLUsuarios);
      setUsuariosL(resp.data.usuarios);
    } catch (error) {
      showAlert("error", "Error al obtener datos de los usuarios.");
      console.error("Error al obtener datos de los usuarios:", error);
    }
  };

  useEffect(() => {
    getUsuarios();
  }, []);

  const empty = () => {
    setUsuario("");
    setNombre("");
    setApellidos("");
    setCelular("");
    setCorreo("");
    setPass("");
    setConfirmPass("");
    setLoading(false);
  }

  const reg = async () => {
    setErrorAll(false);
    setErrorUsuario(false);
    setErrorNombre(false);
    setErrorApellidos(false);
    setErrorCelular(false);
    setErrorCorreo(false);
    setErrorPass(false);
    setErrorConfirmPass(false);
    const valUsu = /^(?=.*[A-Z])[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.,/*-_=+]{3,20}$/;
    const valNomApe = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]{3,25}$/;
    const valCel = /^(?=.*\d)[0-9]{10}$/;
    const valEm = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.,/*-_=+]+@[a-zA-Z]{4,8}\.[a-zA-Z]{2,4}$/;
    const valPa = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.,/*-_=+]{8,20}$/;
    if (!usuario && !nombre && !apellidos && !celular && !correo && !pass && !confirmPass) {
      showAlert("error", "Complete primero los campos.");
      return setErrorAll(true);
    } else if (!usuario) {
      showAlert("error", "Debe ingresar un usuario.");
      return setErrorUsuario(true);
    } else if (!valUsu.test(usuario)) {
      showAlert("error", "Ingrese un nombre de usuario válido.");
      return setErrorUsuario(true);
    } else if (usuariosList.map((user) => user.Usuario).includes(usuario)) {
      showAlert("error", "Ese nombre de usuario ya está registrado...");
      return setErrorUsuario(true);
    } else if (!nombre) {
      showAlert("error", "Debe ingresar su nombre.");
      return setErrorNombre(true);
    } else if (!valNomApe.test(nombre)) {
      showAlert("error", "Ingrese un nombre válido.");
      return setErrorNombre(true);
    } else if (!apellidos) {
      showAlert("error", "Debe ingresar sus apellidos.");
      return setErrorApellidos(true);
    } else if (!valNomApe.test(apellidos)) {
      showAlert("error", "Ingrese un apellido válido.");
      return setErrorApellidos(true);
    } else if (!celular) {
      showAlert("error", "Debe ingresar su número de celular.");
      return setErrorCelular(true);
    } else if (!valCel.test(celular)) {
      showAlert("error", "Ingrese un número de celular válido.");
      return setErrorCelular(true);
    } else if (usuariosList.some(user => user.Celular === parseInt(celular))) {
      showAlert("error", "Ese número de celular ya está registrado...");
      return setErrorCelular(true);
    } else if (!correo) {
      showAlert("error", "Debe ingresar su correo electrónico.");
      return setErrorCorreo(true);
    } else if (!valEm.test(correo)) {
      showAlert("error", "Ingrese un correo electrónico válido.");
      return setErrorCorreo(true);
    } else if (usuariosList.some(user => user.Correo === correo)) {
      showAlert("error", "Ese correo ya está registrado...");
      return setErrorCorreo(true);
    } else if (!pass) {
      showAlert("error", "Debe ingresar una contraseña.");
      return setErrorPass(true);
    } else if (!valPa.test(pass)) {
      showAlert("error", "Ingrese una contraseña válida.");
      return setErrorPass(true);
    } else if (!confirmPass) {
      showAlert("error", "Debe confirmar la contraseña.");
      return setErrorConfirmPass(true);
    } else if (pass !== confirmPass) {
      showAlert("error", "Las contraseñas deben ser iguales.");
      setErrorPass(true);
      return setErrorConfirmPass(true);
    } else {
      showAlert("success", "Registrando...");
      await Axios.post(URLUsuarios, {
        IdRol: 3,
        Usuario: usuario,
        Estado: true,
        Nombre: nombre,
        Apellidos: apellidos,
        Celular: celular,
        Correo: correo,
        Pass: pass,
      }).then(() => {
        setTimeout(() => {
          showAlert("success", "Registro exitoso.");
          empty();
          navigate("/auth/sign-in");
        }, 500);
      }).catch((error) => {
        showAlert("error", "Error al registrar el usuario.");
        console.error("Error al registrar el usuario:", error);
      });
      empty();
    }
  }

  const [ver, setVer] = useState(true);

  const toggleVer = () => {
    setVer(!ver);
  };

  return (
    <div>
      <section className="m-8 grid grid-cols-5 gap-2">
        <div className="contFormUp col-span-3 w-auto h-auto p-5 flex flex-col justify-center bg-gray-200 rounded-3xl">
          <div className="text-center">
            <Typography variant="h2" className="font-bold mt-5">Registro</Typography>
          </div>
          <form className="my-4 grid grid-cols-2 mx-auto">
            <div className="flex flex-col col-span-2">
              <div className={`${errorAll || errorUsuario ? "divError" : ""} mt-3 relative flex items-center`}>
                <Input
                  className={errorAll || errorUsuario ? "error" : ""}
                  label="Nombre de usuario"
                  value={usuario}
                  readOnly={loading}
                  onChange={(event) => { setUsuario(event.target.value) }} />
                <span className={`absolute right-3 ${usuario.length > 30 || errorAll || errorUsuario ? "text-[rgb(255,0,0)]" : null}`}>{usuario.length}/30</span>
              </div>
              <span className={`${errorAll || errorUsuario ? "text-[rgb(255,0,0)]" : "text-gray-700 "} text-sm pl-3 mt-1`}>Debe tener de 3 a 20 caracteres y al menos una mayúscula.</span>
            </div>
            <div className={`${errorAll || errorNombre ? "divError" : ""} mt-3 me-2 flex flex-col`}>
              <Input
                className={`${errorAll || errorNombre ? "error" : ""}`}
                label="Nombre"
                value={nombre}
                readOnly={loading}
                onChange={(event) => { setNombre(event.target.value) }} />
            </div>
            <div className={`${errorAll || errorApellidos ? "divError" : ""} mt-3 ms-2 flex flex-col`}>
              <Input
                className={errorAll || errorApellidos ? "error" : ""}
                label="Apellido"
                value={apellidos}
                readOnly={loading}
                onChange={(event) => { setApellidos(event.target.value) }} />
            </div>
            <div className=" flex flex-col">
              <div className={`${celular.length > 10 || errorAll || errorCelular ? "divError" : ""} mt-3 me-2 flex relative items-center`}>
                <Input
                  className={`${celular.length > 10 || errorAll || errorCelular ? "error" : ""} pr-14`}
                  type="number"
                  label="Celular"
                  value={celular}
                  readOnly={loading}
                  onChange={(event) => { setCelular(event.target.value) }} />
                <span className={`absolute right-3 ${celular.length > 10 || errorAll || errorCelular ? "text-[rgb(255,0,0)]" : null}`}>{celular.length}/10</span>
              </div>
              <span className={`${errorAll || errorCelular ? "text-[rgb(255,0,0)]" : "text-gray-700 "} text-sm pl-3 mt-1`}>Debe ser un número de 10 dígitos.</span>
            </div>
            <div className={`${errorAll || errorCorreo ? "divError" : ""} mt-3 ms-2 flex flex-col`}>
              <Input
                className={errorAll || errorCorreo ? "error" : ""}
                type="email"
                label="Correo"
                value={correo}
                readOnly={loading}
                onChange={(event) => { setCorreo(event.target.value) }} />
              <span className={`${errorAll || errorCorreo ? "text-[rgb(255,0,0)]" : "text-gray-700 "} text-sm pl-3 mt-1`}>Ejemplo@gmail.com</span>
            </div>
            <div className="flex flex-col">
              <div className={`${errorAll || errorPass ? "divError" : ""} relative mt-3 me-2 flex items-center`}>
                <Input
                  className={errorAll || errorPass ? "error" : ""}
                  type={ver ? "password" : "text"}
                  label="Contraseña"
                  value={pass}
                  readOnly={loading}
                  onChange={(event) => { setPass(event.target.value) }} />
                <span className={`absolute right-10 ${pass.length > 30 || errorAll || errorPass ? "text-[rgb(255,0,0)]" : null}`}>{pass.length}/30</span>
                <button className={`ml-2 absolute right-3`} type="button" onClick={toggleVer}>{ver ? <EyeIcon className={`${errorAll || errorPass ? "text-[rgb(255,0,0)]" : ""} h-5`} /> : <EyeSlashIcon className={`${errorAll || errorPass ? "text-[rgb(255,0,0)]" : ""} h-5`} />}</button>
              </div>
              <span className={`${errorAll || errorPass ? "text-[rgb(255,0,0)]" : "text-gray-700 "} text-sm pl-3 mt-1`}>Debe tener de 8 a 30 caracteres, al menos una mayúscula y un número.</span>
            </div>
            <div className={`${errorAll || errorConfirmPass ? "divError" : ""} mt-3 ms-2 flex flex-col`}>
              <Input
                className={errorAll || errorConfirmPass ? "error" : ""}
                type={ver ? "password" : "text"}
                label="Confirmar contraseña"
                value={confirmPass}
                readOnly={loading}
                onChange={(event) => { setConfirmPass(event.target.value) }} />
              <span className={`${errorAll || errorConfirmPass ? "text-[rgb(255,0,0)]" : "text-gray-700 "} text-sm pl-3 mt-1`}>Las contraseñas deben ser iguales.</span>
            </div>
            <Button className="btnGray mt-3 col-span-2" disabled={loading} onClick={() => { reg() }}>
              Registrarme
            </Button>
            <Typography variant="paragraph" className="col-span-2 text-center text-black font-medium mt-3">
              Ya tengo una cuenta,
              <Link to={`${loading ? "#" : "/auth/sign-in"} `} className="text-[rgb(180,0,0)]"> Iniciar Sesión.</Link>
            </Typography>
          </form>
        </div>
        <div className="contLogo flex col-span-2 items-center">
          <img
            src="/img/logo-login-black.png"
            className="object-cover rounded-3xl"
          />
        </div>
      </section>
    </div>
  );
}

export default SignUp;
