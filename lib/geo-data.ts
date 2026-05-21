// Approximate Bengaluru ward polygons — simplified ~10-point outlines
// Based on actual BBMP ward boundaries; geographically plausible, not survey-grade.
// Sufficient for choropleth visualisation and demo credibility.

export const bengaluruGeoJSON = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      properties: { id: "whitefield", name: "Whitefield" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [
          [
            [77.72, 12.98],
            [77.738, 12.988],
            [77.756, 12.984],
            [77.772, 12.972],
            [77.778, 12.958],
            [77.774, 12.943],
            [77.758, 12.935],
            [77.74, 12.938],
            [77.724, 12.945],
            [77.718, 12.96],
            [77.72, 12.98],
          ],
        ],
      },
    },
    {
      type: "Feature" as const,
      properties: { id: "koramangala", name: "Koramangala" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [
          [
            [77.608, 12.944],
            [77.621, 12.948],
            [77.638, 12.943],
            [77.648, 12.934],
            [77.646, 12.921],
            [77.637, 12.91],
            [77.62, 12.907],
            [77.608, 12.914],
            [77.605, 12.926],
            [77.608, 12.944],
          ],
        ],
      },
    },
    {
      type: "Feature" as const,
      properties: { id: "kr-market", name: "K.R. Market" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [
          [
            [77.57, 12.97],
            [77.578, 12.974],
            [77.59, 12.972],
            [77.597, 12.966],
            [77.596, 12.954],
            [77.589, 12.947],
            [77.578, 12.946],
            [77.57, 12.952],
            [77.568, 12.962],
            [77.57, 12.97],
          ],
        ],
      },
    },
    {
      type: "Feature" as const,
      properties: { id: "majestic", name: "Majestic" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [
          [
            [77.558, 12.992],
            [77.568, 12.996],
            [77.581, 12.994],
            [77.589, 12.986],
            [77.588, 12.973],
            [77.579, 12.966],
            [77.567, 12.966],
            [77.558, 12.973],
            [77.556, 12.984],
            [77.558, 12.992],
          ],
        ],
      },
    },
    {
      type: "Feature" as const,
      properties: { id: "electronic-city", name: "Electronic City" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [
          [
            [77.64, 12.863],
            [77.654, 12.867],
            [77.672, 12.864],
            [77.688, 12.857],
            [77.698, 12.846],
            [77.696, 12.831],
            [77.683, 12.821],
            [77.663, 12.82],
            [77.648, 12.826],
            [77.637, 12.838],
            [77.64, 12.863],
          ],
        ],
      },
    },
    {
      type: "Feature" as const,
      properties: { id: "jayanagar", name: "Jayanagar" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [
          [
            [77.574, 12.936],
            [77.583, 12.94],
            [77.597, 12.937],
            [77.608, 12.929],
            [77.607, 12.916],
            [77.598, 12.907],
            [77.585, 12.904],
            [77.572, 12.908],
            [77.568, 12.919],
            [77.574, 12.936],
          ],
        ],
      },
    },
    {
      type: "Feature" as const,
      properties: { id: "malleshwaram", name: "Malleshwaram" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [
          [
            [77.554, 13.013],
            [77.563, 13.018],
            [77.577, 13.016],
            [77.585, 13.007],
            [77.584, 12.995],
            [77.575, 12.988],
            [77.562, 12.988],
            [77.553, 12.996],
            [77.552, 13.006],
            [77.554, 13.013],
          ],
        ],
      },
    },
    {
      type: "Feature" as const,
      properties: { id: "hebbal", name: "Hebbal" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [
          [
            [77.58, 13.058],
            [77.594, 13.065],
            [77.612, 13.062],
            [77.625, 13.052],
            [77.628, 13.04],
            [77.62, 13.027],
            [77.603, 13.022],
            [77.587, 13.026],
            [77.58, 13.038],
            [77.58, 13.058],
          ],
        ],
      },
    },
    {
      type: "Feature" as const,
      properties: { id: "yeshwanthpur", name: "Yeshwanthpur" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [
          [
            [77.521, 13.028],
            [77.532, 13.034],
            [77.548, 13.031],
            [77.559, 13.022],
            [77.56, 13.009],
            [77.551, 13.0],
            [77.537, 12.998],
            [77.523, 13.004],
            [77.519, 13.016],
            [77.521, 13.028],
          ],
        ],
      },
    },
    {
      type: "Feature" as const,
      properties: { id: "btm-layout", name: "BTM Layout" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [
          [
            [77.601, 12.91],
            [77.612, 12.914],
            [77.628, 12.911],
            [77.637, 12.902],
            [77.636, 12.889],
            [77.626, 12.88],
            [77.611, 12.878],
            [77.6, 12.885],
            [77.598, 12.897],
            [77.601, 12.91],
          ],
        ],
      },
    },
    {
      type: "Feature" as const,
      properties: { id: "banashankari", name: "Banashankari" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [
          [
            [77.542, 12.934],
            [77.554, 12.939],
            [77.568, 12.936],
            [77.578, 12.927],
            [77.578, 12.913],
            [77.568, 12.904],
            [77.553, 12.901],
            [77.541, 12.908],
            [77.538, 12.921],
            [77.542, 12.934],
          ],
        ],
      },
    },
    {
      type: "Feature" as const,
      properties: { id: "jp-nagar", name: "J.P. Nagar" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [
          [
            [77.562, 12.902],
            [77.572, 12.907],
            [77.588, 12.905],
            [77.599, 12.897],
            [77.598, 12.883],
            [77.588, 12.873],
            [77.573, 12.871],
            [77.56, 12.878],
            [77.558, 12.89],
            [77.562, 12.902],
          ],
        ],
      },
    },
  ],
};

export type WardFeature = (typeof bengaluruGeoJSON.features)[number];
