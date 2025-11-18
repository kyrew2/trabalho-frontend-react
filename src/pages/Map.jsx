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
  const [newPointCoords, setNewPointCoords] = useState(null); 
  const [newPointDescription, setNewPointDescription] = useState(""); 
  const [newPointImage, setNewPointImage] = useState(null); // NOVO ESTADO: para o arquivo de imagem
  const [selectedMarker, setSelectedMarker] = useState(null); 

  // ... (useJsApiLoader e useEffect permanecem os mesmos)
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

  // Função para capturar as coordenadas ao clicar no mapa e mostrar o formulário
  const handleMapClick = (event) => {
    setSelectedMarker(null);

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setNewPointCoords({ lat, lng });
    setNewPointDescription("");
    setNewPointImage(null); // Limpa a imagem anterior
  };

  // Função para lidar com o clique em um marcador (para exibir a descrição)
  const handleMarkerClick = (marker) => {
    setNewPointCoords(null);
    setSelectedMarker(marker);
  };

  // Função para salvar o novo ponto com a descrição E a imagem
  const handleSavePoint = async (e) => {
    e.preventDefault();
    if (!newPointCoords || !newPointDescription.trim()) {
      alert("A descrição é obrigatória.");
      return;
    }
    
    // Preparando os dados para envio (usando FormData para incluir o arquivo)
    const formData = new FormData();
    formData.append('latitude', newPointCoords.lat);
    formData.append('longitude', newPointCoords.lng);
    formData.append('descricao', newPointDescription.trim());
    
    // Adiciona o arquivo de imagem se houver
    if (newPointImage) {
      formData.append('image', newPointImage); // 'image' é o nome do campo esperado pelo backend
    }
    
    try {
        // Chamada atualizada, note que o postPoint agora precisa lidar com FormData
        const savedPoint = await postPoint(token, formData, true); 

        // O backend precisa retornar o URL da imagem salva (se aplicável)
        const savedMarker = {
            id: savedPoint.id,
            title: savedPoint.descricao || "Novo Ponto",
            position: {
                lat: savedPoint.latitude,
                lng: savedPoint.longitude,
            },
            // Supondo que o backend retorna o URL da imagem (image_url)
            imageUrl: savedPoint.imageUrl, 
        };

        setMarkers((prev) => [...prev, savedMarker]);

        setNewPointCoords(null);
        setNewPointDescription("");
        setNewPointImage(null); // Limpa o estado da imagem
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
                onClick={() => handleMarkerClick(marker)}
              />
            ))}

            {/* Exibe o InfoWindow se um marcador for selecionado (descrição do ponto) */}
            {selectedMarker && (
              <InfoWindow
                position={selectedMarker.position}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="p-2" style={{ color: '#000000', backgroundColor: '#F7EEDD', border: '2px solid #000000' }}>
                  <h3 className="font-bold text-lg mb-1">{selectedMarker.title}</h3>
                  {/* NOVO: Exibe a imagem se houver um URL */}
                  {selectedMarker.imageUrl && (
                      <img src={selectedMarker.imageUrl} alt={selectedMarker.title} style={{ maxWidth: '100px', maxHeight: '100px', marginTop: '8px', border: '1px solid #000000' }} />
                  )}
                  <p className="text-sm mt-2">Lat: {selectedMarker.position.lat.toFixed(4)}</p>
                  <p className="text-sm">Lng: {selectedMarker.position.lng.toFixed(4)}</p>
                </div>
              </InfoWindow>
            )}

            {/* Marcador temporário para o novo ponto */}
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

        {/* Formulário de Adicionar Ponto (Modal-like) - NOVO ESTILO E CAMPO DE IMAGEM */}
        {newPointCoords && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#F7EEDD] p-6 rounded-none border-4 border-[#000000] shadow-[10px_10px_0_0_#A35E49] z-20 w-80 text-[#000000]">
            <h2 className="text-xl font-bold mb-4 uppercase text-center">Cadastrar Novo Pet</h2>
            <form onSubmit={handleSavePoint}>
              <div className="mb-4">
                <Input
                  label="Descrição"
                  placeholder="Ex: Nome do animal, raça, etc."
                  type="text"
                  required
                  value={newPointDescription}
                  onChange={(e) => setNewPointDescription(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1">Foto do Pet (Opcional)</label>
                <input
                    type="file"
                    accept="image/*"
                    className="w-full text-xs p-2 border-3 border-black bg-white"
                    onChange={(e) => setNewPointImage(e.target.files[0])}
                />
              </div>
              <p className="text-sm mb-4 text-center">
                Lat: {newPointCoords.lat.toFixed(4)}, Lng: {newPointCoords.lng.toFixed(4)}
              </p>
              <div className="flex justify-between gap-4">
                <Button
                  type="button"
                  onClick={() => setNewPointCoords(null)}
                  style={{
                    backgroundColor: '#F7EEDD',
                    color: '#000000',
                    border: '3px solid #000000',
                    boxShadow: '4px 4px 0px #A35E49',
                    flex: 1
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" style={{ flex: 1 }}>
                  Salvar Pet
                </Button>
              </div>
            </form>
          </div>
        )}

      </div>
    </>
  );
};