import React, { useState, useEffect } from "react";
import { Typography, Input, Button } from "@material-tailwind/react";
import Swal from 'sweetalert2';
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Link } from 'react-router-dom';
import { useAuth } from '../dashboard/authContext';
import classNames from 'classnames';

export function NotFound() {
  return (
    <div className="contLogin">
      <section className="m-8 flex gap-4">
        <div className="w-1/2 lg:w-3/5 flex flex-col justify-center items-center bg-gray-200  rounded-3xl">
          <h1 className="font-bold text-7xl">Error 404</h1>
          {!localStorage.getItem("idU") ?
            (<Link to="/auth/sign-in" className="pt-24"><Button>Volver</Button></Link>) :
            (<Link to="/dashboard/agenda" className="pt-24 pb-5"><Button>Volver</Button></Link>)}

        </div>
        <div className="w-1/2 h-full hidden lg:block">
          <img
            src="/img/logo-login-black.png"
            className="h-full w-full object-cover lg:w" />
        </div>
      </section >
    </div >
  );
}

export default NotFound;