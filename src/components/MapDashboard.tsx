"use client";

import { useMemo, useState, useEffect } from "react";
import { Map, MapControls, MapPopup, useMap } from "@/components/ui/map";
import { ChevronLeft } from "lucide-react";


import { AnomalyData } from "@/types";

interface MapDashboardProps {
  data?: AnomalyData[];
  selectedAnomaly?: AnomalyData | null;
}

// Internal component to handle efficient WebGL rendering
function AnomaliesLayer({ 
  groupedData, 
  onSelect 
}: { 
  groupedData: AnomalyData[][], 
  onSelect: (group: AnomalyData[]) => void 
}) {
  const { map, isLoaded } = useMap();
  const sourceId = "anomalies-source";
  const layerIdCircles = "anomalies-circles";
  const layerIdCount = "anomalies-count";

  // Convert grouped data to GeoJSON
  const geoJson = useMemo(() => {
    return {
      type: "FeatureCollection",
      features: groupedData.map((group, index) => {
        const first = group[0];
        const maxScore = Math.max(...group.map(i => i.anomalyScore));
        
        return {
          type: "Feature",
          id: index,
          geometry: {
            type: "Point",
            coordinates: [first.lng, first.lat]
          },
          properties: {
            id: index,
            count: group.length,
            maxScore: maxScore,
            groupIndex: index
          }
        };
      })
    };
  }, [groupedData]);
  
useEffect(() => {
  if (!map || !isLoaded) return;

  const hideWaterLabels = () => {
    // Get all layers from the current map style
    const layers = map.getStyle().layers;
    
    if (layers) {
      layers.forEach((layer) => {
        // Most basemaps use 'water_name', 'water-name', or 'water-label' 
        // for labels like 'South China Sea' or 'Philippine Sea'
        if (
          layer.type === 'symbol' && 
          (layer.id.includes('water') || layer.id.includes('marine'))
        ) {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      });
    }
  };

  // Run on load and whenever the style might change
  hideWaterLabels();
  map.on('style.load', hideWaterLabels);

  return () => {
    map.off('style.load', hideWaterLabels);
  };
}, [map, isLoaded]);

  useEffect(() => {
    if (!map || !isLoaded) return;

    // Add Source
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "geojson",
        data: geoJson as any
      });
    } else {
      (map.getSource(sourceId) as any).setData(geoJson);
    }

    // Add Circle Layer
    if (!map.getLayer(layerIdCircles)) {
      map.addLayer({
        id: layerIdCircles,
        type: "circle",
        source: sourceId,
        paint: {
          "circle-color": [
            "interpolate",
            ["linear"],
            ["get", "maxScore"],
            // 40, "#008236",
            // 60, "#ffb700",
            // 75, "#ff6b00",
            // 90, "#ff3000"
            40, "#e2f100",
            60, "yellow",
            75, "orange",
            90, "red"
          ],
          "circle-radius": [
            "case",
            [">", ["get", "count"], 1], 9,
            6
          ],
          "circle-stroke-width": 0,
          "circle-stroke-color": [
            "interpolate",
            ["linear"],
            ["get", "maxScore"],
            // 40, "#008236",
            // 60, "#ffb700",
            // 75, "#ff6b00",
            // 90, "#ff3000"
            40, "#e2f100",
            60, "yellow",
            75, "orange",
            90, "red"
          ],
          "circle-opacity": 0.8
        }
      });
    }

    // Add Symbol Layer for Counts
    if (!map.getLayer(layerIdCount)) {
      map.addLayer({
        id: layerIdCount,
        type: "symbol",
        source: sourceId,
        filter: [">", ["get", "count"], 1],
        layout: {
          "text-field": ["get", "count"],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 10,
          "text-allow-overlap": true
        },
        paint: {
          "text-color": "#ffffff"
        }
      });
    }

    // Event Handlers
    const handleClick = (e: any) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const index = feature.properties.groupIndex;
        onSelect(groupedData[index]);
      }
    };

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    map.on('click', layerIdCircles, handleClick);
    map.on('mouseenter', layerIdCircles, handleMouseEnter);
    map.on('mouseleave', layerIdCircles, handleMouseLeave);
    map.on('click', layerIdCount, handleClick);
    map.on('mouseenter', layerIdCount, handleMouseEnter);
    map.on('mouseleave', layerIdCount, handleMouseLeave);

    return () => {
      map.off('click', layerIdCircles, handleClick);
      map.off('mouseenter', layerIdCircles, handleMouseEnter);
      map.off('mouseleave', layerIdCircles, handleMouseLeave);
      map.off('click', layerIdCount, handleClick);
      map.off('mouseenter', layerIdCount, handleMouseEnter);
      map.off('mouseleave', layerIdCount, handleMouseLeave);
      
      // Check if map style is loaded before trying to access layers
      // This prevents "Cannot read properties of undefined (reading 'getLayer')"
      // when the map instance is being destroyed or style is changing
      if (map.getStyle()) {
        if (map.getLayer(layerIdCount)) map.removeLayer(layerIdCount);
        if (map.getLayer(layerIdCircles)) map.removeLayer(layerIdCircles);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      }
    };
  }, [map, isLoaded, geoJson, groupedData, onSelect]);

  return null;
}

// Legend component for the map
function Legend() {
  return (
    <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-md shadow-md border border-gray-200">
      <div className="text-xs font-bold text-gray-700 mb-1.5">Anomaly Score</div>
      <div 
        className="w-64 h-3 rounded-sm mb-1" 
        style={{
          background: "linear-gradient(to right,#2B9229, #e2f100, #ffff00, #ffa500, #ff0000)"
        }}
      />
      <div className="flex justify-between text-[10px] text-gray-600 font-medium w-64">
        <span>0</span>
        <span>40</span>
        <span>60</span>
        <span>75</span>
        <span>90+</span>
      </div>
    </div>
  );
}

interface MapContentProps {
  groupedData: AnomalyData[][];
  selectedAnomaly: AnomalyData | null | undefined;
  setSelectedGroup: (group: AnomalyData[] | null) => void;
}

function MapContent({ groupedData, selectedAnomaly, setSelectedGroup }: MapContentProps) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (selectedAnomaly && isLoaded && map) {
      const group = groupedData.find(g => g.some(item => item.id === selectedAnomaly.id));
      if (group) {
        setSelectedGroup(group);
        map.flyTo({
          center: [selectedAnomaly.lng, selectedAnomaly.lat],
          zoom: 12, // or a suitable zoom level
          duration: 1500,
        });
      }
    }
  }, [selectedAnomaly, isLoaded, map, groupedData, setSelectedGroup]);

  return (
    <AnomaliesLayer 
      groupedData={groupedData} 
      onSelect={setSelectedGroup} 
    />
  );
}

export function MapDashboard({ data = [], selectedAnomaly }: MapDashboardProps) {
  const [selectedGroup, setSelectedGroup] = useState<AnomalyData[] | null>(null);
  const [detailsPrecinctId, setDetailsPrecinctId] = useState<number | null>(null);


  const groupedData = useMemo(() => {
    const groups: Record<string, AnomalyData[]> = {};
    data.forEach((item) => {
      const key = `${item.lat},${item.lng}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });
    return Object.values(groups);
  }, [data]);

  const selectedFirst = selectedGroup ? selectedGroup[0] : null;

  const handleClosePopup = () => {
    setSelectedGroup(null);
    setDetailsPrecinctId(null);
  }

  return (
    <div className="w-full">
      <div className=" w-full h-[calc(100vh-147px)] rounded-lg overflow-hidden border border-border shadow-sm relative">
        <Legend />
        <Map
          center={[121.7740, 12.8797]}
          zoom={4.75}
          theme="light"
        >
          <MapControls 
            showZoom={true} 
            showCompass={true} 
            showFullscreen={true}
            position="bottom-right"
          />
          
          <MapContent 
            groupedData={groupedData}
            selectedAnomaly={selectedAnomaly}
            setSelectedGroup={setSelectedGroup}
          />

          {selectedGroup && selectedFirst && (
            <MapPopup 
              longitude={selectedFirst.lng} 
              latitude={selectedFirst.lat}
              closeButton={true}
              onClose={handleClosePopup}
              maxWidth="320px"
              className="p-0 overflow-hidden"
            >
              <div className="w-[280px] flex flex-col font-sans">
                <div className="p-3 border-b border-gray-100 bg-white">
                  <h4 className="text-base font-bold text-gray-900 leading-tight">{selectedFirst.name}</h4>
                  <div className="text-[12px] text-gray-500 mt-1">
                    <p>
                    {selectedFirst.municipality}, {selectedFirst.province} 
                    </p>

                    Region {selectedFirst.region}
                  </div>
                  {selectedGroup.length > 1 && (
                    <div className="mt-2 text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                      {selectedGroup.length} Precincts in this area
                    </div>
                  )}
                </div>

                <div className="max-h-[320px] overflow-y-auto divide-y divide-gray-100 bg-gray-50/30">
                  {selectedGroup.map((row) => (
                    <div key={row.id} className="p-3">
                      {detailsPrecinctId === row.id ? (
                        // Detailed View
                        <div>
                          <button className="mb-2 w-full inline-flex items-center justify-start text-sm font-medium px-3 py-2 rounded-md hover:bg-gray-100 transition-colors" onClick={() => setDetailsPrecinctId(null)}>
                            <ChevronLeft className="w-4 h-4 mr-2"/>
                            Back
                          </button>
                           <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                            <div>
                              <div className="text-[9px] text-gray-400 uppercase font-bold">Residual</div>
                              <div className="text-sm font-bold text-gray-900">{row.residual.toFixed(2)}σ</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-gray-400 uppercase font-bold">Spatial Dev Z-Score</div>
                              <div className="text-sm font-bold text-gray-900">{row.spatialDevZScore.toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-gray-400 uppercase font-bold">Overvote Rate</div>
                              <div className="text-xs font-semibold text-gray-700">{row.overvoteRate !== null ? (row.overvoteRate * 100).toFixed(2) + '%' : 'N/A'}</div>
                            </div>
                             <div>
                              <div className="text-[9px] text-gray-400 uppercase font-bold">Undervote Rate</div>
                              <div className="text-xs font-semibold text-gray-700">{row.undervoteRate !== null ? (row.undervoteRate * 100).toFixed(2) + '%' : 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-gray-400 uppercase font-bold">Gi* Z-Score</div>
                              <div className="text-sm font-bold text-gray-900">{row.giStarZScore.toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-gray-400 uppercase font-bold">Registered Voters</div>
                              <div className="text-sm font-bold text-gray-900">{row.registeredVoters}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-gray-400 uppercase font-bold">Actual Voters</div>
                              <div className="text-sm font-bold text-gray-900">{row.actualVoters}</div>
                            </div>
                             <div>
                              <div className="text-[9px] text-gray-400 uppercase font-bold">Valid Votes</div>
                              <div className="text-sm font-bold text-gray-900">{row.validVotes}</div>
                            </div>
                             <div>
                              <div className="text-[9px] text-gray-400 uppercase font-bold">Over Votes</div>
                              <div className="text-sm font-bold text-gray-900">{row.overVotes}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-gray-400 uppercase font-bold">Under Votes</div>
                              <div className="text-sm font-bold text-gray-900">{row.underVotes}</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Summary View
                        <div className="bg-white p-4 rounded-xl shadow-lg w-full">
                          {/* Header: Precinct ID & Status Badge */}
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Precinct</div>
                              <div className="text-sm font-bold text-gray-800">{row.precinctNumber}</div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              row.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                              row.priority === 'High' ? 'bg-orange-100 text-orange-500' :
                              row.priority === 'Medium' ? 'bg-yellow-100 text-yellow-500' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {row.priority}
                            </span>
                          </div>

                          {/* Anomaly Score */}
                          <div className="text-center my-4">
                            <div className="text-xs text-gray-500 uppercase font-bold">Anomaly Score</div>
                            <div className={`text-3xl font-bold sans-serif ${
                              row.anomalyScore > 80 ? 'text-red-600' : 
                              row.anomalyScore > 60 ? 'text-orange-500' : 
                              'text-gray-800'
                            }`}>
                              {row.anomalyScore.toFixed(1)}
                            </div>
                          </div>

                          {/* Details: Turnout vs Expected */}
                          <div className="border-t border-gray-100 pt-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-[10px] text-gray-400 uppercase font-bold">Turnout</div>
                                <div className="text-sm font-semibold text-gray-700">{(row.turnout * 100).toFixed(1)}%</div>
                              </div>
                              <div className="text-gray-400 text-sm">
                                {((row.turnout - row.expected) * 100).toFixed(1)}% 
                                {row.turnout > row.expected ? ' ▲' : ' ▼'}
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] text-gray-400 uppercase font-bold">Expected</div>
                                <div className="text-sm font-semibold text-gray-700">{(row.expected * 100).toFixed(1)}%</div>
                              </div>
                            </div>
                            <div className="relative w-full h-2 bg-gray-200 rounded-full mt-2">
                                <div 
                                    className="absolute top-0 left-0 h-2 bg-blue-500 rounded-full" 
                                    style={{ width: `${(row.turnout / (row.turnout + row.expected)) * 100}%` }}
                                ></div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <button 
                            className="w-full mt-6 text-sm px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors" 
                            onClick={() => setDetailsPrecinctId(row.id)}
                          >
                            More Info
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </MapPopup>
          )}
        </Map>
      </div>
    </div>
  );
}