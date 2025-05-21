import React, { useState, useEffect, Fragment } from "react";
import { Typography, Card, CardHeader, CardBody, CardFooter, Input, Button } from "@material-tailwind/react";
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../dashboard/authContext';
import Axios from "axios";
import { Dialog, Transition } from '@headlessui/react';
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export function Recovery() {

  function showAlert(icon = "success", title, time = 1500) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: time,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    Toast.fire({ icon, title });
  }

  const navigate = useNavigate();
  const { login } = useAuth();

  const [usuariosList, setUsuariosL] = useState([]);
  const [email, setEmail] = useState("");
  const [errorEmail, setErrorEmail] = useState(false);

  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const getUsuarios = async () => {
    try {
      const resp = await Axios.get("http://localhost:8080/api/usuarios");
      setUsuariosL(resp.data.usuarios);
    } catch (error) {
      showAlert("error", "Error al obtener datos de los usuarios.");
      console.error("Error al obtener datos de los usuarios:", error);
    }
  };

  useEffect(() => {
    getUsuarios()
  }, []);

  const handleForgotPassword = async (e) => {
    setLoading(false);
    setErrorEmail(false);
    const valEm = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.,/*\-_=+]+@[a-zA-Z]{4,8}\.[a-zA-Z]{2,4}$/;
    if (!email) {
      showAlert("error", "Ingrese un correo.")
      return setErrorEmail(true);
    } else if (!valEm.test(email)) {
      showAlert("error", "Ingrese un correo válido.");
      return setErrorEmail(true);
    }
    setLoading(true);
    if (usuariosList.find((user) => user.Correo.toLowerCase() == email.toLowerCase())) {
      try {
        const response = await Axios.post("http://localhost:8080/api/auth/recovery", { Correo: email });
        showAlert("success", `${response.data.msg} a ${email}`, 3000);
        setLoading(false);
        setOpen(true);
      } catch (error) {
        console.log(error);
      }
    } else {
      showAlert("error", "Ese correo no está registrado.");
      setLoading(false);
      return setErrorEmail(true);
    }
  };

  const [ver, setVer] = useState(true);
  const toggleVer = () => {
    setVer(!ver)
  }

  const [cod, setCod] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [allError, setAllError] = useState(false);
  const [codError, setCodError] = useState(false);
  const [passError, setPassError] = useState(false);
  const [confirmPassError, setConfirmPassError] = useState(false);

  const validarCod = async () => {
    setAllError(false);
    setCodError(false);
    setPassError(false);
    setConfirmPassError(false);
    const valCod = /^(?=.*\d)[0-9]{6}$/;
    const valPa = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.,/*-_=+]{8,30}$/;
    if (!cod && !pass && !confirmPass) {
      showAlert("error", "Complete el formulario.");
      return setAllError(true);
    } else if (!cod) {
      showAlert("error", "Ingrese el código.");
      return setCodError(true);
    } else if (!valCod.test(cod)) {
      showAlert("error", "Código inválido.");
      return setCodError(true);
    } else if (!pass) {
      showAlert("error", "Ingrese una contraseña.");
      return setPassError(true);
    } else if (!valPa.test(pass)) {
      showAlert("error", "Ingrese una contraseña válida.");
      return setPassError(true);
    } else if (!confirmPass) {
      showAlert("error", "Confirme la contraseña.");
      return setConfirmPassError(true);
    } else if (pass !== confirmPass) {
      showAlert("error", "Las contraseñas deben ser iguales.");
      setPassError(true);
      return setConfirmPassError(true);
    }
    try {
      setLoading(true)
      await Axios.post("http://localhost:8080/api/auth/reset-password", {
        Cod: cod,
        Pass: pass
      }).then(() => {
        setOpen(false);
        setTimeout(() => {
          showAlert("success", "Cambio de contraseña completado con éxito.");
          empty();
          navigate("/auth/sign-in");
        }, 1000);
      }).catch((error) => {
        setLoading(false)
        console.log(error);
        return showAlert("error", error.response.data.msg);
      })
    } catch (error) {
      return showAlert("error", error.response.data.msg);
    }
  }

  const empty = () => {
    setCod("")
    setPass("")
    setConfirmPass("")
    setOpen(false)
    setAllError(false);
    setCodError(false);
    setPassError(false);
    setConfirmPassError(false);
    setVer(true);
    setLoading(false);
  }

  return (
    <div className="contLogin">
      {loading ? <div className="h-full w-full left-0 top-0 fixed z-50 grid content-center justify-center items-center bg-[rgba(0,0,0,0.3)] text-4xl"
        style={{ WebkitTextStroke: "1px white" }}><img src="/public/img/logo-login-black.png" alt="Cargando..." className="h-[300px]" /><span className="h-full flex justify-center pt-5 font-bold">Cargando...</span></div> : null}
      <section className="m-8 grid grid-cols-5 gap-2">
        <div className="contFormUp col-span-3 w-auto h-auto p-5 flex flex-col justify-center bg-gray-200 rounded-3xl">
          <div className="text-center">
            <Typography variant="h2" className="font-bold mt-5">Recuperar contraseña</Typography>
          </div>
          <form className="my-4 mx-auto w-80 max-w-screen-lg lg:w-1/2"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.nodeName !== 'TEXTAREA' && e.target.type !== 'submit') {
                e.preventDefault();
                handleForgotPassword();
              }
            }}>
            <div className={`${errorEmail ? "divError" : ""} mb-1 flex flex-col gap-4`}>
              <Input
                className={errorEmail ? "error" : ""}
                type="email"
                label="Correo"
                value={email}
                readOnly={loading}
                onChange={(event) => { setEmail(event.target.value) }} />
            </div>
            <span className={`${errorEmail ? "error" : ""} text-sm ms-3`}>Ingrese el correo con el que está registrado.</span>
            <div className="grid grid-cols-2 gap-5">
              <Button fullWidth
                className="btnGray mt-3"
                disabled={loading}
                onClick={() => handleForgotPassword()}>
                Recuperar
              </Button>
              <Link to="/auth/sign-in">
                <Button fullWidth
                  disabled={loading}
                  className="btnGray mt-3">
                  Volver
                </Button>
              </Link>
            </div>
          </form>
        </div>
        <div className="contLogo flex col-span-2 items-center">
          <img
            src="/img/logo-login-black.png"
            className="object-cover rounded-3xl" />
        </div>
      </section>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => { }}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                <form onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.nodeName !== 'TEXTAREA' && e.target.type !== 'submit') {
                    e.preventDefault();
                    validarCod();
                  }
                }}>
                  <Card className={`col-span-2 w-[500px]`}>
                    <CardHeader variant="gradient" className="mb-4 valCodRec">
                      <Typography variant="h6" color="white" className="flex justify-between items-center">
                        Validación de código
                      </Typography>
                    </CardHeader>
                    <CardBody className="pt-0 pb-5">
                      <div className={`${codError || allError ? "divError" : ""} mb-1 flex flex-col`}>
                        <Input
                          className={codError || allError ? "error" : ""}
                          label="Ingrese el código de validación"
                          type="number"
                          value={cod}
                          readOnly={loading}
                          onChange={(e) => { setCod(e.target.value) }} />
                        <span className={`${codError || allError ? "error" : ""} text-sm line-clamp-none text-left ms-3`}>El código de 6 dígitos fué enviado al correo "{email}".</span>
                      </div>
                      <div>
                        <div className={`${pass.length > 30 || passError || allError ? "divError" : ""} flex items-center relative mt-4`}>
                          <Input
                            className={`${pass.length > 99 ? "pr-[95px]" : "pr-[85px]"} ${pass.length > 30 || passError || allError ? "error" : ""}`}
                            label="Contraseña"
                            value={pass}
                            readOnly={loading}
                            onChange={(event) => setPass(event.target.value)}
                            type={ver ? "password" : "text"} />
                          <span className={`${pass.length > 30 || passError || allError ? "text-[rgb(240,0,0)!important]" : ""} absolute right-10 text-black`}>{pass.length}/30</span>
                          <button type="button" className={`${pass.length > 30 || passError || allError ? "text-[rgb(240,0,0)!important]" : ""} ml-2 text-black absolute right-3`} onClick={toggleVer}>{ver ? <EyeIcon className="h-5" /> : <EyeSlashIcon className="h-5" />}</button>
                        </div>
                        <div className="flex">
                          <span className={`${allError || passError ? "text-[rgb(255,0,0)]" : "text-gray-700 "} text-sm line-clamp-none text-left pl-1 mt-1`}>Debe tener de 8 a 30 caracteres, al menos una mayúscula y un número.</span>
                        </div>
                      </div>
                      <div className={`${confirmPassError || allError ? "divError" : ""} mt-4`}>
                        <Input
                          className={`${confirmPassError || allError ? "error" : ""}`}
                          label="Confirmar contraseña"
                          value={confirmPass}
                          readOnly={loading}
                          onChange={(event) => setConfirmPass(event.target.value)}
                          type={ver ? "password" : "text"} />
                      </div>
                    </CardBody>
                    <hr />
                    <CardFooter className="p-3">
                      <Button className="btnGray"
                        disabled={loading}
                        onClick={() => { validarCod() }}>
                        Cambiar
                      </Button>
                      <Button className="btnGray ms-5"
                        disabled={loading}
                        onClick={() => { empty() }}>
                        Cancelar
                      </Button>
                    </CardFooter>
                  </Card>
                </form>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}

export default Recovery;