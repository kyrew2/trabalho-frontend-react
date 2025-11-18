import { useEffect, useState } from "react";
import { Navbar, Input, Button } from "../components";
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from "@react-google-maps/api";
import { getPoints, postPoint } from '../services/mapService';
import { useAuth } from "../contexts/AuthContext";

const containerStyle = {
  width: "100%",
  // Altura do mapa ajustada para ocupar o espaço restante da tela, menos a altura da Navbar (65px)
  height: "calc(100vh - 65px)",
};

const defaultCenter = {
  lat: -23.55052,
  lng: -46.633308,
};

export const Map = () => {
  const { token } = useAuth();
  const [markers, setMarkers] = useState([]);
  const [newPointCoords, setNewPointCoords] = useState(null); // Coordenadas do novo ponto clicado
  const [newPointDescription, setNewPointDescription] = useState(""); // Descrição do novo ponto
  const [selectedMarker, setSelectedMarker] = useState(null); // Marcador selecionado para InfoWindow

  // Substitua pela sua chave da API do Google Maps (já usa VITE_GOOGLE_MAPS_API_KEY)
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    async function fetchMarkers() {
      try {
        const data = await getPoints(token);
        setMarkers(data);
      } catch (error) {
        console.log(error.message);
      }
    }
    fetchMarkers();
  }, [token]);

  // Função para capturar as coordenadas ao clicar no mapa e mostrar o formulário (Tarefa 4)
  const handleMapClick = (event) => {
    // Fecha qualquer InfoWindow aberta
    setSelectedMarker(null);

    // Configura as coordenadas para o novo ponto
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setNewPointCoords({ lat, lng });
    setNewPointDescription(""); // Limpa a descrição anterior
  };

  // Função para lidar com o clique em um marcador (para exibir a descrição) (Tarefa 4)
  const handleMarkerClick = (marker) => {
    // Fecha o formulário de novo ponto
    setNewPointCoords(null);
    setSelectedMarker(marker);
  };

  // Função para salvar o novo ponto com a descrição (Tarefa 4)
  const handleSavePoint = async (e) => {
    e.preventDefault();
    if (!newPointCoords || !newPointDescription.trim()) {
      alert("A descrição é obrigatória.");
      return;
    }

    const newPoint = {
      latitude: newPointCoords.lat,
      longitude: newPointCoords.lng,
      descricao: newPointDescription.trim(),
    };

    try {
      const savedPoint = await postPoint(token, newPoint);

      // Converte o ponto salvo para o formato de marcador
      const savedMarker = {
        id: savedPoint.id,
        title: savedPoint.descricao || "Novo Ponto",
        position: {
          lat: savedPoint.latitude,
          lng: savedPoint.longitude,
        },
      };

      setMarkers((prev) => [...prev, savedMarker]);

      // Limpar o formulário após salvar
      setNewPointCoords(null);
      setNewPointDescription("");

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      <Navbar />
      {/* O mapa ocupa o espaço restante */}
      <div style={{ width: "100%", height: "calc(100vh - 65px)" }}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={12}
            onClick={handleMapClick}
          >
            {/* Renderização dos Marcadores Existentes */}
            {markers.map(marker => (
              <Marker
                key={marker.id}
                position={marker.position}
                title={marker.title}
                onClick={() => handleMarkerClick(marker)} // Adicionado o handler
              />
            ))}

            {/* Exibe o InfoWindow se um marcador for selecionado (descrição do ponto) */}
            {selectedMarker && (
              <InfoWindow
                position={selectedMarker.position}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="p-2 text-black">
                  <h3 className="font-bold text-lg mb-1">{selectedMarker.title}</h3>
                  <p className="text-sm">Lat: {selectedMarker.position.lat.toFixed(4)}</p>
                  <p className="text-sm">Lng: {selectedMarker.position.lng.toFixed(4)}</p>
                </div>
              </InfoWindow>
            )}

            {/* Marcador temporário para o novo ponto (usa o ícone padrão do Google) */}
            {newPointCoords && (
              <Marker
                position={newPointCoords}
              />
            )}

          </GoogleMap>
        ) : (
          <div className="flex justify-center items-center h-full">
            <h1 className="text-white text-2xl">Carregando mapa...</h1>
          </div>
        )}

        {/* Formulário de Adicionar Ponto (Modal-like) - Estilo Blocky/Dark */}
        {newPointCoords && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black p-6 rounded-none border-4 border-white shadow-[10px_10px_0_0_#FFFFFF] z-20 w-80">
            <h2 className="text-xl font-bold mb-4 text-white uppercase text-center">Cadastrar Novo Ponto</h2>
            <form onSubmit={handleSavePoint}>
              <div className="mb-4">
                <Input
                  label="Descrição"
                  placeholder="Adicione uma descrição..."
                  type="text"
                  required
                  value={newPointDescription}
                  onChange={(e) => setNewPointDescription(e.target.value)}
                />
              </div>
              <p className="text-sm mb-4 text-white text-center">
                Lat: {newPointCoords.lat.toFixed(4)}, Lng: {newPointCoords.lng.toFixed(4)}
              </p>
              <div className="flex justify-between gap-4">
                <Button
                  type="button"
                  onClick={() => setNewPointCoords(null)}
                  style={{
                    backgroundColor: '#000000',
                    color: '#FFFFFF',
                    border: '3px solid #FFFFFF',
                    boxShadow: '4px 4px 0px #FFFFFF',
                    flex: 1
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" style={{ flex: 1 }}>
                  Salvar Ponto
                </Button>
              </div>
            </form>
          </div>
        )}

      </div>
    </>
  );
};