import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  TouchableOpacity,
  Image
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera, useCameraDevice, useCodeScanner } from "react-native-vision-camera";
import Toast from "react-native-toast-message";


const QRScanner = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [scannedCode, setScannedCode] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [existingProduct, setExistingProduct] = useState(null);
  const [modalAnim] = useState(new Animated.Value(200));

  const device = useCameraDevice("back");

  useEffect(() => {
    const requestCameraPermission = async () => {
      const status = await Camera.requestCameraPermission();
      if (status === "granted") {
        setHasPermission(true);
      } else {
        Toast.show({ type: "error", text1: "Permission Denied", text2: "Camera access is required to scan barcodes." });
      }
    };

    requestCameraPermission();
  }, []);

  const showModal = () => {
    setModalVisible(true);
    setTimeout(() => {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }, 5);
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
      Toast.show({ type: "error", text1: "Error", text2: "Please enter a valid quantity." });
      return;
    }

    if (!existingProduct && (!productName || !price)) {
      Toast.show({ type: "error", text1: "Error", text2: "Please fill all fields." });
      return;
    }

    const newProduct = {
      id: existingProduct ? existingProduct.id : Date.now(),
      code: scannedCode,
      name: existingProduct ? existingProduct.name : productName,
      price: existingProduct ? existingProduct.price : parseFloat(price),
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

      Toast.show({
        type: "success",
        text1: "Success",
        text2: existingProduct ? "Product quantity updated!" : "Product added successfully!",
      });

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
            <Image
              source={require("../assets/tab/logo.png")}
              style={styles.logo}
            />

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
                    onChangeText={(text) => setQuantity(text.replace(/[^0-9]/g, ""))}
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

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 15,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
    width: "100%",
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  quantityButton: {
    fontSize: 24,
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: "#007bff",
    color: "white",
    borderRadius: 5,
    marginHorizontal: 10,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    textAlign: "center",
    width: 60,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  submitButton: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginRight: 5,
  },
  closeButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});


export default QRScanner;
