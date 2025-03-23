import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  TouchableOpacity
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera, useCameraDevice, useCodeScanner } from "react-native-vision-camera";

const QRScanner = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [scannedCode, setScannedCode] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [existingProduct, setExistingProduct] = useState(null);
  const [modalAnim] = useState(new Animated.Value(300)); 

  const device = useCameraDevice("back");

  useEffect(() => {
    const requestCameraPermission = async () => {
      const status = await Camera.requestCameraPermission();
      if (status === "granted") {
        setHasPermission(true);
      } else {
        Alert.alert("Permission Denied", "Camera access is required to scan barcodes.");
      }
    };

    requestCameraPermission();
  }, []);

  const showModal = () => {
    setModalVisible(true); 
    setTimeout(() => {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 300, 
        useNativeDriver: true,
      }).start();
    }, 10); 
  };


  const hideModal = () => {
    Animated.timing(modalAnim, {
      toValue: 300, 
      duration: 500,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const checkLocalStorage = async (code) => {
    try {
      const storedProducts = await AsyncStorage.getItem("products");
      const products = storedProducts ? JSON.parse(storedProducts) : [];

      const existing = products.find((p) => p.code === code);

      if (existing) {
        setScannedCode(code);
        setExistingProduct(existing);
        setQuantity(existing.quantity.toString()); 
        showModal();
      } else {
        setScannedCode(code);
        setProductName("");
        setPrice("");
        setQuantity("");
        setExistingProduct(null);
        showModal();
      }
    } catch (error) {
      console.error("Error checking local storage:", error);
    }
  };

  const handleSubmit = async () => {
    if (!quantity || parseInt(quantity, 10) <= 0) {
      Alert.alert("Error", "Please enter a valid quantity.");
      return;
    }

    if (!existingProduct && (!productName || !price)) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    const newProduct = {
      id: existingProduct ? existingProduct.id : Date.now(),
      code: scannedCode,
      name: existingProduct ? existingProduct.name : productName, // Use existing name if updating
      price: existingProduct ? existingProduct.price : parseFloat(price), // Keep existing price
      quantity: parseInt(quantity, 10),
    };

    try {
      const storedProducts = await AsyncStorage.getItem("products");
      let products = storedProducts ? JSON.parse(storedProducts) : [];

      if (existingProduct) {
        products = products.map((p) =>
          p.code === scannedCode ? { ...p, quantity: newProduct.quantity } : p
        );
      } else {
        products.push(newProduct);
      }

      await AsyncStorage.setItem("products", JSON.stringify(products));

      Alert.alert("Success", existingProduct ? "Product quantity updated!" : "Product added successfully!");
      setProductName("");
      setPrice("");
      setQuantity("");
      setExistingProduct(null);
      hideModal();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };


  const codeScanner = useCodeScanner({
    codeTypes: ["qr", "ean-13"],
    onCodeScanned: (codes) => {
      if (codes.length > 0) {
        const scannedValue = codes[0].value;
        console.log(`Scanned Code: ${scannedValue}`);
        checkLocalStorage(scannedValue);
      }
    },
  });

  if (!device) return <Text style={styles.errorText}>No Camera Found</Text>;
  if (!hasPermission) return <Text style={styles.errorText}>Camera permission required</Text>;

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
      />

      {modalVisible && (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View style={[styles.modalContainer, { transform: [{ translateY: modalAnim }] }]}>
            <Text style={styles.modalTitle}>
              {existingProduct ? "Update Product Quantity" : "Enter Product Details"}
            </Text>

            {existingProduct ? (
              <>
                <Text style={styles.productName}>{existingProduct.name}</Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity onPress={() => setQuantity((prev) => Math.max(1, parseInt(prev) - 1).toString())}>
                    <Text style={styles.quantityButton}>-</Text>
                  </TouchableOpacity>

                  <TextInput
                    style={styles.quantityInput}
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={(text) => setQuantity(text.replace(/[^0-9]/g, ""))} // Allow only numbers
                  />


                  <TouchableOpacity onPress={() => setQuantity((prev) => (parseInt(prev) + 1).toString())}>
                    <Text style={styles.quantityButton}>+</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Product Name"
                  value={productName}
                  onChangeText={setProductName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Price"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Quantity"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={hideModal}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  errorText: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 18,
    color: "red",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButton: {
    fontSize: 24,
    paddingHorizontal: 15,
    color: "white",
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  quantityInput: {
    width: 50,
    textAlign: "center",
    fontSize: 18,
    borderWidth: 1,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  submitButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 10,
  },
  closeButton: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default QRScanner;
