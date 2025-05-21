import { Link } from "react-router-dom";
import React, { useState } from "react";
import { Typography, Input, Button } from "@material-tailwind/react";
import Swal from 'sweetalert2';
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../dashboard/authContext';

export function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();

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

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const [errorEmail, setErrorEmail] = useState(false);
  const [errorPass, setErrorPass] = useState(false);

  const [ver, setVer] = useState(true);

  const [loading, setLoading] = useState(false);

  const toggleVer = () => {
    setVer(!ver);
  };

  const Ing = async () => {
    setErrorEmail(false);
    setErrorPass(false);
    const valEm = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.,/*\-_=+]+@[a-zA-Z]{4,8}\.[a-zA-Z]{2,4}$/;
    const valPa = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.,/*\-_=+]{8,30}$/;
    if (!email && !pass) {
      showAlert("warning", "Ingrese un correo y una contraseña.");
      setErrorPass(true);
      return setErrorEmail(true);
    } else if (!email) {
      showAlert("warning", "Ingrese un correo.");
      return setErrorEmail(true);
    } else if (!pass) {
      showAlert("warning", "Ingrese una contraseña.");
      return setErrorPass(true);
    } else if (!valEm.test(email)) {
      showAlert("error", "Ingrese un correo válido.");
      return setErrorEmail(true);
    } else if (!valPa.test(pass)) {
      showAlert("error", "Ingrese una contraseña válida.");
      return setErrorPass(true);
    } else {
      setLoading(true);
      const result = await login(email, pass);
      if (result.success) {
        if (result.user.Estado) {
          showAlert("success", `Bienvenid@, ${result.user.Usuario}`);
          setTimeout(() => {
            navigate('/dashboard/agenda');
            empty();
          }, 500);
        } else {
          return showAlert("error", `El usuario ${result.user.Usuario} se encuentra inactivo, comuníquese con un adminsitrador.`, 5000);
        }
      } else if (result.message === "Ese correo no está registrado...") {
        return setErrorEmail(true);
      } else if (result.message === "La contraseña es incorrecta...") {
        return setErrorPass(true);
      } else {
        showAlert("error", result.message)
      }
    }
  };

  const empty = () => {
    setEmail("");
    setPass("");
    setLoading(false);
  };

  return (
    <div className="contLogin">
      <section className="m-8 grid grid-cols-5 gap-2">
        <div className="contFormUp col-span-3 w-auto h-auto p-5 flex flex-col justify-center bg-gray-200 rounded-3xl">
          <div className="text-center">
            <Typography variant="h2" className="font-bold mt-5">Inicio de sesión</Typography>
          </div>
          <form className="my-4 mx-auto w-80 max-w-screen-lg lg:w-1/2"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.nodeName !== 'TEXTAREA' && e.target.type !== 'submit') {
                e.preventDefault();
                Ing();
              } else if (e.key === "Escape" && e.target.nodeName !== 'TEXTAREA') {
                empty()
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
              <div className={`${errorPass ? "divError" : ""} flex items-center relative`}>
                <Input
                  className={`${errorPass ? "error" : ""} ${pass.length > 99 ? "pr-24" : "pr-20"}`}
                  label="Contraseña"
                  type={ver ? "password" : "text"}
                  value={pass}
                  readOnly={loading}
                  onChange={(event) => { setPass(event.target.value) }} />
                <span className={`absolute right-10 ${pass.length > 30 || errorPass ? "text-[rgb(255,0,0)]" : null}`}>{pass.length}/30</span>
                <button className={`ml-2 absolute right-3`} type="button" onClick={toggleVer}>{ver ? <EyeIcon className={`${errorPass ? "text-[rgb(255,0,0)]" : ""} h-5`} /> : <EyeSlashIcon className={`${errorPass ? "text-[rgb(255,0,0)]" : ""} h-5`} />}</button>
              </div>
            </div>
            <div className="flex mt-1">
              <Typography variant="small" className="font-medium">
                <Link to={`${loading ? "#" : "/auth/recovery"} `} className="text-[rgb(180,0,0)]">
                  ¿Olvidaste la contraseña?
                </Link>
              </Typography>
            </div>
            <Button fullWidth
              className="btnGray mt-3"
              disabled={loading}
              onClick={() => Ing()}>
              Ingresar
            </Button>
            <Typography variant="paragraph" className="text-center text-black font-medium mt-3">
              No tengo una cuenta,
              <Link to={`${loading ? "#" : "/auth/sign-up"} `}
                className="text-[rgb(180,0,0)]"> Registrarme.</Link>
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

export default SignIn;