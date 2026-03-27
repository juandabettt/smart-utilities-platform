package com.smartutilities.backend.strategies;

import com.smartutilities.backend.models.UtilityBill;
import org.springframework.stereotype.Component;
import weka.classifiers.lazy.IBk;
import weka.core.DenseInstance;
import weka.core.Instances;
import weka.core.converters.ConverterUtils.DataSource;

import java.io.InputStream;

@Component
public class WekaAnomalyDetectionStrategy implements AnalysisStrategy {

    private IBk classifier;
    private Instances trainingData;

    public WekaAnomalyDetectionStrategy() {
        try {
            // 1. Cargar el archivo desde resources/data/
            InputStream is = getClass().getResourceAsStream("/data/utility_data.arff");

            if (is == null) {
                throw new Exception("No se encontró el archivo 'utility_data.arff' en la ruta /data/");
            }

            DataSource source = new DataSource(is);
            trainingData = source.getDataSet();

            // 2. Establecer la columna objetivo (la última: 'status')
            if (trainingData.classIndex() == -1) {
                trainingData.setClassIndex(trainingData.numAttributes() - 1);
            }

            // 3. Configurar y entrenar el algoritmo KNN (IBk)
            classifier = new IBk();
            classifier.buildClassifier(trainingData);

            System.out.println(">>> [IA] Cerebro de Weka entrenado con éxito desde el recurso.");
        } catch (Exception e) {
            System.err.println(">>> [ERROR FATAL] Error al inicializar Weka: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public String analyze(UtilityBill bill) {
        if (classifier == null || trainingData == null) {
            System.err.println(">>> [IA] Error: El clasificador no está inicializado.");
            return "ERROR_CONFIG";
        }

        try {
            // 4. Mapear los datos de la factura al formato de Weka
            // El array debe tener el mismo tamaño que las columnas del .arff (3)
            double[] values = new double[trainingData.numAttributes()];

            // values[0] = consumption (según tu .arff)
            values[0] = bill.getRegisteredConsumption();
            // values[1] = amount (según tu .arff)
            values[1] = bill.getAmount();
            // values[2] = status (se deja como 0 o vacío porque es lo que vamos a predecir)

            DenseInstance instance = new DenseInstance(1.0, values);
            instance.setDataset(trainingData);

            // 5. Realizar la predicción
            double result = classifier.classifyInstance(instance);

            // Convertir el resultado numérico al nombre de la categoría (NORMAL o
            // ANOMALOUS)
            String verdict = trainingData.classAttribute().value((int) result);

            System.out.println(">>> [IA] Análisis Factura " + bill.getReferenceNumber() +
                    " | Consumo: " + values[0] +
                    " | Veredicto: " + verdict);

            return verdict;

        } catch (Exception e) {
            System.err.println(">>> [IA] Error durante el análisis: " + e.getMessage());
            return "ERROR_PROCESS";
        }
    }
}
