import React, { useState } from "react";
import { Navbar, Logo, Title, Input, Button } from "../components";
import { signIn } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    try {
      const { token } = await signIn(email, senha);
      login(token);
      navigate("/map");
    } catch (err) {
      setErro(err.message);
    }
  };

  return (
    <>
      {/* Container com o estilo blocky/vintage do Figma */}
      <div className="max-w-sm mx-auto p-8 mt-10 border-4 border-black bg-[#F7EEDD] shadow-[10px_10px_0_0_#A35E49] text-black">
        <div className="text-center">
          <Logo />
        </div>

        <div className="pt-6 pb-4">
          <Title title="FAÇA SEU LOGIN" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="pb-4">
            <Input
              label="Email"
              placeholder="Digite seu email..."
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="pb-4">
            <Input
              label="Senha"
              placeholder="Digite sua senha..."
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
          {/* Cor de erro de alto contraste */}
          {erro && <p style={{ color: "#A35E49" }} className="text-center pb-4 font-bold">{erro}</p>}

          <div className="text-center pt-8">
            <Button
              type="submit"
              onClick={handleSubmit}
            >
              ACESSAR
            </Button>
          </div>
        </form>

        <div className="text-center pt-8">
          <Link
            to="/register"
            className="text-black hover:text-[#A35E49] hover:underline transition-colors duration-200 font-bold"
          >
            Ainda não tem cadastro? <strong>Crie sua conta</strong>
          </Link>
        </div>
      </div>
    </>
  );
}