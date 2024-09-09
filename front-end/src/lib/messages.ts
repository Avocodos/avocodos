import io from "@/lib/socketio";
import supabase from "@/lib/supabase";

export const listenForMessages = () => {
    const channels = supabase.channel('custom-all-channel')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'messages' },
            (payload) => {
                console.log('Change received!', payload)
            }
        )
        .subscribe()
    channels.on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload) => {
        console.log('Change received! ', payload)
        if (payload.eventType === "INSERT") {
            io.emit("new_message", payload.new);
        }
        if (payload.eventType === "UPDATE") {
            io.emit("message_updated", payload.new);
        }
        if (payload.eventType === "DELETE") {
            io.emit("message_deleted", payload.old);
        }
    })
}