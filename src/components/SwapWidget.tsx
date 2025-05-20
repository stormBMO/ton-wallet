import { useEffect, useRef } from "react";
import { createSwap } from "@mytonswap/widget";
import { useTonConnectUI } from "@tonconnect/ui-react";

const MyTonSwapWidget = () => {
    const [tc] = useTonConnectUI();
    const initMount = useRef<boolean>(false);

    useEffect(() => {
        if (tc) {
            if (initMount.current) {
                return;
            }
            initMount.current = true;
            createSwap("swap-component", { tonConnectInstance: tc });
        }
    }, [tc]);

    return (
        <div
            id="swap-component"
            style={{ width: "100%", height: "100%" }}
        ></div>
    );
};

export default MyTonSwapWidget;