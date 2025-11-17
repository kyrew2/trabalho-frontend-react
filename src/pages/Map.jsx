import { useEffect, useState } from "react";
import { Navbar, Input, Button } from "../components"; // Adicionado Input e Button
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from "@react-google-maps/api"; // Adicionado InfoWindow
import { getPoints, postPoint } from '../services/mapService';
import { useAuth } from "../contexts/AuthContext";

const containerStyle = {
  width: "100%",
  // Altura do mapa ajustada para ocupar o espaço restante da tela, menos a altura da Navbar (65px)
  height: "calc(100vh - 65px)",
};

// Posição inicial do mapa (São Paulo)
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

  // 1. Função para capturar as coordenadas ao clicar no mapa e mostrar o formulário
  const handleMapClick = (event) => {
    // Fecha qualquer InfoWindow aberta
    setSelectedMarker(null);

    // Configura as coordenadas para o novo ponto
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setNewPointCoords({ lat, lng });
    setNewPointDescription(""); // Limpa a descrição anterior
  };

  // 2. Função para lidar com o clique em um marcador (para exibir a descrição)
  const handleMarkerClick = (marker) => {
    // Fecha o formulário de novo ponto
    setNewPointCoords(null);
    setSelectedMarker(marker);
  };

  // 3. Função para salvar o novo ponto com a descrição
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
      // Opcional: alert("Ponto cadastrado com sucesso!");

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ width: "100%", height: "100%" }}>
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
                <div className="p-2">
                  <h3 className="font-bold">{selectedMarker.title}</h3>
                  <p>Lat: {selectedMarker.position.lat.toFixed(4)}</p>
                  <p>Lng: {selectedMarker.position.lng.toFixed(4)}</p>
                </div>
              </InfoWindow>
            )}

            {/* Marcador temporário para o novo ponto */}
            {newPointCoords && (
              <Marker
                position={newPointCoords}
                icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
              />
            )}

          </GoogleMap>
        ) : (
          <div>Carregando mapa...</div>
        )}

        {/* Formulário de Adicionar Ponto (Modal-like) */}
        {newPointCoords && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl z-10 w-80">
            <h2 className="text-lg font-bold mb-4">Cadastrar Novo Ponto</h2>
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
              <p className="text-sm mb-4">
                Lat: {newPointCoords.lat.toFixed(4)}, Lng: {newPointCoords.lng.toFixed(4)}
              </p>
              <div className="flex justify-between">
                <Button
                  type="button"
                  onClick={() => setNewPointCoords(null)}
                  className="bg-gray-400 hover:bg-gray-500" // Tailwind para cor de botão
                >
                  Cancelar
                </Button>
                <Button type="submit">
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