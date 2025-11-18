import React, { useState } from "react";
import { Navbar, Logo, Title, Input, Button } from "../components";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "../services/authService";

export function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro("");
        try {
            await signUp(name, email, senha);
            navigate("/login");
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
                    <Title title="CADASTRO DE USUÁRIO" />
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="pb-4">
                        <Input
                            label="Nome"
                            placeholder="Digite seu nome..."
                            type="text"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div className="pb-4">
                        <Input
                            label="Email"
                            placeholder="Digite seu email..."
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="pb-4">
                        <Input
                            label="Senha"
                            placeholder="Digite sua senha..."
                            type="password"
                            required
                            value={senha}
                            onChange={e => setSenha(e.target.value)}
                        />
                    </div>

                    {/* Cor de erro de alto contraste */}
                    {erro && <p style={{ color: "#ff4d4d" }} className="text-center pb-4">{erro}</p>}

                    <div className="text-center pt-8">
                        <Button type="submit">CADASTRAR</Button>
                    </div>
                </form>

                <div className="text-center pt-8">
                    <Link to="/login" className="text-white hover:text-[#ff4d4d] hover:underline transition-colors duration-200">
                        Já tem cadastro? <strong>Faça Login</strong>
                    </Link>
                </div>
            </div>
        </>
    );
}