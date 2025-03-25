type RouteName = "Home" | "ProductList" | "Cart";


const getIconSource = (routeName: RouteName, focused: boolean): any => {
    switch (routeName) {
        case "Home":
            return focused
                ? require("../../assets/tab/home-active.png")
                : require("../../assets/tab/home.png");
        case "ProductList":
            return focused
                ? require("../../assets/tab/list-active.png")
                : require("../../assets/tab/list.png");
        case "Cart":
            return focused
                ? require("../../assets/tab/cart-active.png")
                : require("../../assets/tab/cart.png");
        default:
            return null;
    }
};

export default getIconSource;