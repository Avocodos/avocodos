import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import io from 'socket.io-client';

export function useNotificationSocket() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const socket = io();

        socket.on('new_notification', () => {
            queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
        });

        return () => {
            socket.disconnect();
        };
    }, [queryClient]);
}