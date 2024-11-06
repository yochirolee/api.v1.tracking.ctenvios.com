import request from 'supertest';
import express from 'express';
import parcelRoutes from '../src/routes/parcelRoutes';
import * as parcelController from '../src/controllers/parcelController';
import { Server } from 'http';

jest.mock('../src/controllers/parcelController');

const app = express();
app.use(express.json());
app.use('/api/parcels', parcelRoutes);

let server: Server;

beforeAll((done) => {
  server = app.listen(done);
});

afterAll((done) => {
  server.close(done);
});

jest.setTimeout(30000); // Set timeout to 30 seconds

describe('Parcel Routes', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /api/parcels', () => {
    it('should return all parcels', async () => {
      const mockParcels = [{ id: '1', hbl: 'HBL001' }, { id: '2', hbl: 'HBL002' }];
      (parcelController.getAllParcels as jest.Mock).mockResolvedValue(mockParcels);

      const response = await request(app).get('/api/parcels');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockParcels);
      await expect(parcelController.getAllParcels).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      (parcelController.getAllParcels as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/parcels');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Internal server error' });
    });
  });

  describe('GET /api/parcels/:id', () => {
    it('should return a specific parcel', async () => {
      const mockParcel = { id: '1', hbl: 'HBL001' };
      (parcelController.getParcelById as jest.Mock).mockResolvedValue(mockParcel);

      const response = await request(app).get('/api/parcels/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockParcel);
      expect(parcelController.getParcelById).toHaveBeenCalledWith(expect.any(Object), expect.any(Object), expect.any(Function));
    });

    it('should return 404 for non-existent parcel', async () => {
      (parcelController.getParcelById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/parcels/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Parcel not found' });
    });
  });

  describe('POST /api/parcels', () => {
    it('should create a new parcel', async () => {
      const newParcel = { hbl: 'HBL003', status: 'PENDING' };
      const createdParcel = { id: '3', ...newParcel };
      (parcelController.createParcel as jest.Mock).mockResolvedValue(createdParcel);

      const response = await request(app)
        .post('/api/parcels')
        .send(newParcel);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdParcel);
      expect(parcelController.createParcel).toHaveBeenCalledWith(expect.any(Object), expect.any(Object), expect.any(Function));
    });
  });

  describe('PUT /api/parcels/:id', () => {
    it('should update an existing parcel', async () => {
      const updatedParcel = { id: '1', hbl: 'HBL001', status: 'DELIVERED' };
      (parcelController.updateParcel as jest.Mock).mockResolvedValue(updatedParcel);

      const response = await request(app)
        .put('/api/parcels/1')
        .send({ status: 'DELIVERED' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedParcel);
      expect(parcelController.updateParcel).toHaveBeenCalledWith(expect.any(Object), expect.any(Object), expect.any(Function));
    });

    it('should return 404 for non-existent parcel', async () => {
      (parcelController.updateParcel as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/parcels/999')
        .send({ status: 'DELIVERED' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Parcel not found' });
    });
  });

  describe('DELETE /api/parcels/:id', () => {
    it('should delete an existing parcel', async () => {
      (parcelController.deleteParcel as jest.Mock).mockResolvedValue({ id: '1', hbl: 'HBL001' });

      const response = await request(app).delete('/api/parcels/1');

      expect(response.status).toBe(204);
      expect(parcelController.deleteParcel).toHaveBeenCalledWith(expect.any(Object), expect.any(Object), expect.any(Function));
    });

    it('should return 404 for non-existent parcel', async () => {
      (parcelController.deleteParcel as jest.Mock).mockResolvedValue(null);

      const response = await request(app).delete('/api/parcels/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Parcel not found' });
    });
  });
});