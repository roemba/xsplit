

export class XRPUtil {
    static dropsToXRP(drops: number): number {
        return drops / 1000000;
    }

    static XRPtoDrops(XRP: number): number {
        return XRP * 1000000;
    }
}