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
      const token = await signIn(email, senha);
      login(token);
      navigate("/map");
    } catch (err) {
      setErro(err.message);
    }
  };

  return (
    <>
      {/* Container com o estilo blocky/escuro do Figma */}
      <div className="max-w-sm mx-auto p-8 mt-10 border-4 border-white bg-black shadow-[10px_10px_0_0_#FFFFFF]">
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
          {erro && <p style={{ color: "#ff4d4d" }} className="text-center pb-4">{erro}</p>}

          <div className="text-center pt-8">
            {/* O SEGREDO: type="submit" garante que o formulário seja enviado */}
            <Button type="submit">ACESSAR</Button>
          </div>
        </form>

        <div className="text-center pt-8">
          <Link
            to="/register"
            className="text-white hover:text-[#ff4d4d] hover:underline transition-colors duration-200"
          >
            Ainda não tem cadastro? <strong>Crie sua conta</strong>
          </Link>
        </div>
      </div>
    </>
  );
}