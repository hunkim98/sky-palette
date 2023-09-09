import { ColorContext } from "@/context/ColorContext";
import React, { useContext } from "react";
import {
  Annotation,
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Marker,
} from "react-simple-maps";

const MapChart = () => {
  const { colorOrigin } = useContext(ColorContext);
  return (
    <ComposableMap
      style={{
        // maxHeight: 500,
        maxWidth: 400,
      }}
    >
      <Geographies geography="/features.json">
        {({ geographies, projection }) =>
          geographies.map((geo) => (
            <Geography key={geo.rsmKey} geography={geo} fill="#dddddd" />
          ))
        }
      </Geographies>
      {colorOrigin && (
        <>
          <Marker coordinates={[colorOrigin.lng, colorOrigin.lat]}>
            <circle r={6} fill="#F53" />
          </Marker>
          <Annotation
            subject={[colorOrigin.lng, colorOrigin.lat]}
            dx={-15}
            dy={-15}
            connectorProps={{
              stroke: "#FF5533",
              strokeWidth: 3,
              strokeLinecap: "round",
            }}
          >
            <text
              x="-8"
              textAnchor="end"
              alignmentBaseline="middle"
              fill="#F53"
              fontSize="30px"
            >
              {colorOrigin.state}
            </text>
          </Annotation>
        </>
      )}
    </ComposableMap>
  );
};

export default MapChart;
