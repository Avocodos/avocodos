import cron from "node-cron";
import kyInstance from "@/lib/ky";
import { BASE_URL } from "@/lib/constants";

export function startCronJobs() {
    const url = `${BASE_URL}/api/rewards/check-progress`;
    cron.schedule("*/60 * * * * *", async () => {
        try {
            await kyInstance.get(url);
        } catch (error) {
            console.error("Error running rewards progress check:", error);
            console.error("Failed URL:", url);
        }
    });
}