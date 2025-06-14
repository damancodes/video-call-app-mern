import React from 'react';
import { useSocketContext } from '../../SocketContext';
import { Box, Typography, Paper } from '@mui/material';

const RecognizationResult = () => {
    const { recognizationResult } = useSocketContext();

    return (
        <Paper elevation={3} sx={{ p: 2, maxHeight: 300, overflowY: 'auto' }}>
            <Typography variant="h6" gutterBottom>
                Recognition Results
            </Typography>
            <Box>
                {recognizationResult?.length > 0 ? (
                    Array.from(recognizationResult).map((result, i) => (
                        <Typography key={i} variant="body2" sx={{ mb: 1 }}>
                            🗣️ {result[0].transcript}
                        </Typography>
                    ))
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        No speech recognized yet.
                    </Typography>
                )}
            </Box>
        </Paper>
    );
};

export default RecognizationResult;
