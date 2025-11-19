import { useEffect, useState } from "react";
import { Navbar, Input, Button } from "../components";
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from "@react-google-maps/api";
import { getPoints, postPoint } from '../services/mapService';
import { useAuth } from "../contexts/AuthContext";

const containerStyle = {
  width: "100%",
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
  const [newPointImage, setNewPointImage] = useState(null); // Estado para a imagem
  const [selectedMarker, setSelectedMarker] = useState(null);

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

  const handleMapClick = (event) => {
    setSelectedMarker(null);
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setNewPointCoords({ lat, lng });
    setNewPointDescription("");
    setNewPointImage(null); // Limpa o estado da imagem
  };

  const handleMarkerClick = (marker) => {
    setNewPointCoords(null);
    setSelectedMarker(marker);
  };

  const handleSavePoint = async (e) => {
    e.preventDefault();
    if (!newPointCoords || !newPointDescription.trim()) {
      alert("A descrição é obrigatória.");
      return;
    }

    const isImageAttached = !!newPointImage;

    let dataToSend;

    // 1. Prepara os dados para envio (JSON ou FormData)
    if (isImageAttached) {
      dataToSend = new FormData();
      dataToSend.append('latitude', newPointCoords.lat);
      dataToSend.append('longitude', newPointCoords.lng);
      dataToSend.append('descricao', newPointDescription.trim());
      dataToSend.append('image', newPointImage);
    } else {
      dataToSend = {
        latitude: newPointCoords.lat,
        longitude: newPointCoords.lng,
        descricao: newPointDescription.trim(),
      };
    }

    try {
      const savedPoint = await postPoint(token, dataToSend, isImageAttached);

      // 2. CRIAÇÃO ROBUSTA DO MARCADOR
      const savedMarker = {
        id: savedPoint.id,
        title: savedPoint.descricao || newPointDescription.trim(),
        position: newPointCoords, // Usa coordenadas locais para renderização precisa
        imageUrl: savedPoint.imageUrl, // Usa o URL retornado (mock ou real)
      };

      setMarkers((prev) => [...prev, savedMarker]);

      setNewPointCoords(null);
      setNewPointDescription("");
      setNewPointImage(null);
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
                {/* Estilo InfoWindow ajustado para o tema */}
                <div className="p-2" style={{ color: '#000000', backgroundColor: '#F7EEDD', border: '2px solid #000000' }}>
                  <h3 className="font-bold text-lg mb-1">{selectedMarker.title}</h3>
                  {/* Se houver URL da imagem, tenta carregar */}
                  {selectedMarker.imageUrl && (
                    <img
                      src={selectedMarker.imageUrl}
                      alt={selectedMarker.title}
                      // Função onError para lidar com URLs quebradas (Mock ou Real)
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='40%' x='50%' dominant-baseline='middle' text-anchor='middle' font-size='20' fill='%23A35E49'>Sem Foto</text><rect x='10' y='10' width='80' height='80' fill='none' stroke='%23000000' stroke-width='2'/></svg>";
                      }}
                      style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover', marginTop: '8px', border: '2px solid #000000' }}
                    />
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

        {/* Formulário de Adicionar Ponto (Modal-like) - Estilo Vintage Dark/Blocky */}
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

              {/* CAMPO DE FOTO CUSTOMIZADO */}
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1">Foto do Pet (Opcional)</label>

                {/* 1. INPUT DE ARQUIVO REAL (ESCONDIDO) */}
                <input
                  id="pet-file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setNewPointImage(e.target.files[0])}
                />

                {/* 2. LABEL CUSTOMIZADO ESTILIZADO COMO INPUT */}
                <label
                  htmlFor="pet-file-upload"
                  className="w-full text-base cursor-pointer px-4 py-2 block"
                  style={{
                    backgroundColor: '#F7EEDD',
                    border: '3px solid #000000',
                    color: newPointImage ? '#000000' : '#6d6d6d',
                    minHeight: '50px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {newPointImage ? newPointImage.name : "Escolher arquivo..."}
                </label>

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
                  CANCELAR
                </Button>
                <Button type="submit" style={{ flex: 1 }}>
                  SALVAR PET
                </Button>
              </div>
            </form>
          </div>
        )}

      </div>
    </>
  );
};