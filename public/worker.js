importScripts(
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core",
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js",
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm/dist/tf-backend-wasm.js",
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite/dist/tf-tflite.min.js"
);

let tfliteModel = null;

const CLASSES = [
  "unit_number_or_character_visible",
  "package_visible",
  "dropoff_location_visible",
  "person_visible",
  "face",
  "reflection",
  "animal",
  "too_dark",
  "blur",
  "normal_image_quality",
];

const decisionArray = [
  {
    title: "Too dark",
    reasonCode: "too_dark",
    description: "⚡ Increase the light",
    conditions: ["too_dark==true"],
    decisionValue: "insufficientInformation",
    icon: "package/dark_image",
    orderNumber: 1,
    _id: {
      $oid: "67edbb178506b0d5b6415f25",
    },
  },
  {
    title: "None visible",
    reasonCode:
      "package_not_visible_and_dropoff_location_not_visible_and_address_not_visible",
    description: "Point to the package, dropoff location, and address",
    conditions: [
      "unit_number_or_character_visible==false&&package_visible==false&&dropoff_location_visible==false",
    ],
    decisionValue: "insufficientInformation",
    icon: "escooter/no_vehicle_in_image",
    orderNumber: 2,
    _id: {
      $oid: "67edbb178506b0d5b6415f26",
    },
  },
  {
    title: "Only package visible",
    reasonCode:
      "package_visible_and_dropoff_location_not_visible_and_address_not_visible",
    description: "Include the dropoff location, and address, if possible",
    conditions: [
      "package_visible==true&&dropoff_location_visible==false&&unit_number_or_character_visible==false",
    ],
    decisionValue: "insufficientInformation",
    icon: "package/recipient_in_image",
    orderNumber: 3,
    _id: {
      $oid: "67edbb178506b0d5b6415f27",
    },
  },
  {
    title: "Only dropoff location visible",
    reasonCode:
      "package_not_visible_and_dropoff_location_visible_and_address_not_visible",
    description: "Include the package and address if possible",
    conditions: [
      "package_visible==false&&dropoff_location_visible==true&&unit_number_or_character_visible==false",
    ],
    decisionValue: "insufficientInformation",
    icon: "package/no_package",
    orderNumber: 4,
    _id: {
      $oid: "67edbb178506b0d5b6415f28",
    },
  },
  {
    title: "Only address visible",
    reasonCode:
      "package_not_visible_and_dropoff_location_not_visible_and_address_visible",
    description: "Include the package and dropoff location if possible",
    conditions: [
      "package_visible==false&&dropoff_location_visible==false&&unit_number_or_character_visible==true",
    ],
    decisionValue: "insufficientInformation",
    icon: "package/unit_number_mismatched",
    orderNumber: 5,
    _id: {
      $oid: "67edbb178506b0d5b6415f29",
    },
  },
  {
    title: "Only Package not visible",
    reasonCode:
      "package_not_visible_and_dropoff_location_visible_and_address_visible",
    description: "Include the package in the image",
    conditions: [
      "package_visible==false&&unit_number_or_character_visible==true&&dropoff_location_visible==true",
    ],
    decisionValue: "insufficientInformation",
    icon: "package/safe_place",
    orderNumber: 6,
    _id: {
      $oid: "67edbb178506b0d5b6415f2a",
    },
  },
  {
    title: "Only dropoff location not visible",
    reasonCode:
      "package_visible_and_dropoff_location_not_visible_and_address_visible",
    description: "Include dropoff location if possible",
    conditions: [
      "package_visible==true&&dropoff_location_visible==false&&unit_number_or_character_visible==true",
    ],
    decisionValue: "insufficientInformation",
    icon: "package/unit_number_mismatched",
    orderNumber: 7,
    _id: {
      $oid: "67edbb178506b0d5b6415f2b",
    },
  },
  {
    title: "Only address not visible",
    reasonCode:
      "package_visible_and_dropoff_location_visible_and_address_not_visible",
    description: "Include address if possible",
    conditions: [
      "package_visible==true&&dropoff_location_visible==true&&unit_number_or_character_visible==false",
    ],
    decisionValue: "insufficientInformation",
    icon: "package/not_in_a_safe_place",
    orderNumber: 8,
    _id: {
      $oid: "67edbb178506b0d5b6415f2c",
    },
  },
  {
    title: "✅ All visible",
    reasonCode:
      "package_visible_and_dropoff_location_visible_and_address_visible",
    description: "Package, address, and drop-off location are visible",
    conditions: [
      "package_visible==true&&dropoff_location_visible==true&&unit_number_or_character_visible==true",
    ],
    decisionValue: "insufficientInformation",
    icon: "package/unit_number_matched",
    orderNumber: 9,
    _id: {
      $oid: "67edbb178506b0d5b6415f2d",
    },
  },
  {
    title: "No clear decision",
    reasonCode: "no_clear_decision",
    description: "Unable to assess the photo with positive delivery decision",
    conditions: ["decision_default"],
    decisionValue: "insufficientInformation",
    icon: "package/poor_image_quality",
    orderNumber: 10,
    _id: {
      $oid: "67edbb178506b0d5b6415f2e",
    },
  },
];

onmessage = async (e) => {
  try {
    if (e.data.type === "init") {
      tflite.setWasmPath(
        "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite/dist/"
      );
      await tf.setBackend("wasm");
      await tf.ready();
      tfliteModel = await tflite.loadTFLiteModel(e.data.modelPath, {
        numThreads: -1,
      });
      postMessage({ type: "init-done" });
    } else if (e.data.type === "predict" && tfliteModel) {
      console.log(tf.getBackend());
      const { bitmap, width, height } = e.data;

      const outputTensor = tf.tidy(() => {
        const img = tf.browser.fromPixels(bitmap);
        const input = tf.image.resizeBilinear(img, [height, width]);
        const batched = tf.expandDims(input, 0);
        const casted = tf.cast(batched, "int32");
        return tfliteModel.predict(casted);
      });

      const scores = await tf.squeeze(outputTensor).array();
      const predictionSummary = getPredictionSummary(
        scores
          .map((c, i) => ({
            name: CLASSES[i],
            confidence: c,
          }))
          .sort((a, b) => b.confidence - a.confidence)
      );

      const decision = getDecision({
        predictionSummary,
        decisionArray,
      });

      outputTensor.dispose();
      bitmap.close();

      postMessage({
        type: "prediction",
        decision,
      });
    }
  } catch (error) {
    console.error(error);
    postMessage({ type: "error", error: error.message });
  }
};

const getPredictionSummary = (predictions) => {
  if (!predictions) return [];

  const predictionSummary = predictions.map((prediction) => {
    return `${prediction.name}==${prediction.confidence >= 0.5}`;
  });

  return predictionSummary;
};

const getDecision = ({ predictionSummary, decisionArray }) => {
  const decisionArraySorted = decisionArray.sort(
    (a, b) => a.orderNumber - b.orderNumber
  );

  for (const decisionArrayItem of decisionArraySorted) {
    for (const condition of decisionArrayItem.conditions) {
      if (condition.includes("&&")) {
        const subConditions = condition.split("&&");
        if (subConditions.every((sc) => predictionSummary.includes(sc))) {
          return { ...decisionArrayItem, conditions: [condition] };
        }
      } else if (predictionSummary.includes(condition)) {
        return { ...decisionArrayItem, conditions: [condition] };
      }
    }
  }

  return decisionArraySorted[decisionArraySorted.length - 1];
};
