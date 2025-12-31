// Health check endpoint for monitoring
export default function handler(req: any, res: any) {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'The Unfiltered Voice'
    });
}
