import { useState, useEffect } from 'react';
import './ConfigurationsPage.css';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from "react-icons/fa";
import {
  getBatches, createBatch, updateBatch, deleteBatch,
  getRooms, createRoom, updateRoom, deleteRoom,
  getSlots, createSlot, updateSlot, deleteSlot
} from '../../api';
import { toast } from "react-toastify";

const ConfigurationsPage = () => {
  const [activeSection, setActiveSection] = useState('batches');
  
  // State for Batches
  const [batches, setBatches] = useState([]);
  const [editingBatch, setEditingBatch] = useState(null);
  const [newBatch, setNewBatch] = useState({ batchId: '', programme: '', size: '', year: '' });
  
  // State for Rooms
  const [rooms, setRooms] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [newRoom, setNewRoom] = useState({ roomId: '', capacity: '', isLab: false, building: '', floor: '' });
  
  // State for Slots
  const [slots, setSlots] = useState([]);
  const [editingSlot, setEditingSlot] = useState(null);
  const [newSlot, setNewSlot] = useState({ slotId: '', day: 'Monday', startTime: '', endTime: '' });

  // Load data on mount
  useEffect(() => {
    loadBatches();
    loadRooms();
    loadSlots();
  }, []);

  // ============= BATCH FUNCTIONS =============
  const loadBatches = async () => {
    try {
      const res = await getBatches();
      setBatches(res.data);
    } catch (err) {
      console.error("Error loading batches:", err);
    }
  };

  const handleAddBatch = async () => {
    if (!newBatch.batchId || !newBatch.programme || !newBatch.size) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await createBatch(newBatch);
      toast.success('Batch added successfully!');
      setNewBatch({ batchId: '', programme: '', size: '', year: '' });
      loadBatches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding batch');
    }
  };

  const handleUpdateBatch = async (id) => {
    try {
      await updateBatch(id, editingBatch);
      toast.success('Batch updated successfully!');
      setEditingBatch(null);
      loadBatches();
    } catch (err) {
      toast.error('Error updating batch');
    }
  };

  const handleDeleteBatch = async (id) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    try {
      await deleteBatch(id);
      toast.success('Batch deleted successfully!');
      loadBatches();
    } catch (err) {
      toast.error('Error deleting batch');
    }
  };

  // ============= ROOM FUNCTIONS =============
  const loadRooms = async () => {
    try {
      const res = await getRooms();
      setRooms(res.data);
    } catch (err) {
      console.error("Error loading rooms:", err);
    }
  };

  const handleAddRoom = async () => {
    if (!newRoom.roomId || !newRoom.capacity) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await createRoom({ ...newRoom, capacity: parseInt(newRoom.capacity) });
      toast.success('Room added successfully!');
      setNewRoom({ roomId: '', capacity: '', isLab: false, building: '', floor: '' });
      loadRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding room');
    }
  };

  const handleUpdateRoom = async (id) => {
    try {
      await updateRoom(id, { ...editingRoom, capacity: parseInt(editingRoom.capacity) });
      toast.success('Room updated successfully!');
      setEditingRoom(null);
      loadRooms();
    } catch (err) {
      toast.error('Error updating room');
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await deleteRoom(id);
      toast.success('Room deleted successfully!');
      loadRooms();
    } catch (err) {
      toast.error('Error deleting room');
    }
  };

  // ============= SLOT FUNCTIONS =============
  const loadSlots = async () => {
    try {
      const res = await getSlots();
      setSlots(res.data);
    } catch (err) {
      console.error("Error loading slots:", err);
    }
  };

  const handleAddSlot = async () => {
    if (!newSlot.slotId || !newSlot.day || !newSlot.startTime || !newSlot.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await createSlot(newSlot);
      toast.success('Time slot added successfully!');
      setNewSlot({ slotId: '', day: 'Monday', startTime: '', endTime: '' });
      loadSlots();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding slot');
    }
  };

  const handleUpdateSlot = async (id) => {
    try {
      await updateSlot(id, editingSlot);
      toast.success('Time slot updated successfully!');
      setEditingSlot(null);
      loadSlots();
    } catch (err) {
      toast.error('Error updating slot');
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) return;
    try {
      await deleteSlot(id);
      toast.success('Time slot deleted successfully!');
      loadSlots();
    } catch (err) {
      toast.error('Error deleting slot');
    }
  };

  return (
    <div className="configurations-container">
      <h2 style={{ marginBottom: '24px', color: '#374151' }}>Timetable Configurations</h2>
      
      <div className="config-tabs">
        <button
          className={`config-tab ${activeSection === 'batches' ? 'active' : ''}`}
          onClick={() => setActiveSection('batches')}
        >
          Batches
        </button>
        <button
          className={`config-tab ${activeSection === 'rooms' ? 'active' : ''}`}
          onClick={() => setActiveSection('rooms')}
        >
          Lecture Theatres
        </button>
        <button
          className={`config-tab ${activeSection === 'slots' ? 'active' : ''}`}
          onClick={() => setActiveSection('slots')}
        >
          Time Slots
        </button>
      </div>

      {/* ============= BATCHES SECTION ============= */}
      {activeSection === 'batches' && (
        <div className="config-section fade-in">
          <div className="card">
            <h3>Batch Management</h3>
            <p className="section-description">Manage student batches that will be used for course assignment and timetable generation.</p>
            
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Batch ID</th>
                    <th>Programme</th>
                    <th>Size</th>
                    <th>Year</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch) => (
                    <tr key={batch._id}>
                      {editingBatch && editingBatch._id === batch._id ? (
                        <>
                          <td><input value={editingBatch.batchId} onChange={(e) => setEditingBatch({ ...editingBatch, batchId: e.target.value })} /></td>
                          <td><input value={editingBatch.programme} onChange={(e) => setEditingBatch({ ...editingBatch, programme: e.target.value })} /></td>
                          <td><input type="number" value={editingBatch.size} onChange={(e) => setEditingBatch({ ...editingBatch, size: e.target.value })} /></td>
                          <td><input value={editingBatch.year} onChange={(e) => setEditingBatch({ ...editingBatch, year: e.target.value })} /></td>
                          <td>
                            <FaSave className="icon save-icon" onClick={() => handleUpdateBatch(batch._id)} />
                            <FaTimes className="icon cancel-icon" onClick={() => setEditingBatch(null)} />
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{batch.batchId}</td>
                          <td>{batch.programme}</td>
                          <td>{batch.size}</td>
                          <td>{batch.year || '-'}</td>
                          <td>
                            <FaEdit className="icon edit-icon" onClick={() => setEditingBatch(batch)} />
                            <FaTrash className="icon delete-icon" onClick={() => handleDeleteBatch(batch._id)} />
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  <tr className="add-row">
                    <td><input placeholder="B23" value={newBatch.batchId} onChange={(e) => setNewBatch({ ...newBatch, batchId: e.target.value })} /></td>
                    <td><input placeholder="CSE Y23" value={newBatch.programme} onChange={(e) => setNewBatch({ ...newBatch, programme: e.target.value })} /></td>
                    <td><input type="number" placeholder="110" value={newBatch.size} onChange={(e) => setNewBatch({ ...newBatch, size: e.target.value })} /></td>
                    <td><input placeholder="2023" value={newBatch.year} onChange={(e) => setNewBatch({ ...newBatch, year: e.target.value })} /></td>
                    <td><button className="btn btn-success btn-sm" onClick={handleAddBatch}><FaPlus /> Add</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============= ROOMS SECTION ============= */}
      {activeSection === 'rooms' && (
        <div className="config-section fade-in">
          <div className="card">
            <h3>Lecture Theatre Management</h3>
            <p className="section-description">Manage rooms and lecture theatres available for course scheduling.</p>
            
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Room ID</th>
                    <th>Capacity</th>
                    <th>Is Lab</th>
                    <th>Building</th>
                    <th>Floor</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room._id}>
                      {editingRoom && editingRoom._id === room._id ? (
                        <>
                          <td><input value={editingRoom.roomId} onChange={(e) => setEditingRoom({ ...editingRoom, roomId: e.target.value })} /></td>
                          <td><input type="number" value={editingRoom.capacity} onChange={(e) => setEditingRoom({ ...editingRoom, capacity: e.target.value })} /></td>
                          <td>
                            <input
                              type="checkbox"
                              checked={editingRoom.isLab}
                              onChange={(e) => setEditingRoom({ ...editingRoom, isLab: e.target.checked })}
                            />
                          </td>
                          <td><input value={editingRoom.building} onChange={(e) => setEditingRoom({ ...editingRoom, building: e.target.value })} /></td>
                          <td><input value={editingRoom.floor} onChange={(e) => setEditingRoom({ ...editingRoom, floor: e.target.value })} /></td>
                          <td>
                            <FaSave className="icon save-icon" onClick={() => handleUpdateRoom(room._id)} />
                            <FaTimes className="icon cancel-icon" onClick={() => setEditingRoom(null)} />
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{room.roomId}</td>
                          <td>{room.capacity}</td>
                          <td>{room.isLab ? 'Yes' : 'No'}</td>
                          <td>{room.building || '-'}</td>
                          <td>{room.floor || '-'}</td>
                          <td>
                            <FaEdit className="icon edit-icon" onClick={() => setEditingRoom(room)} />
                            <FaTrash className="icon delete-icon" onClick={() => handleDeleteRoom(room._id)} />
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  <tr className="add-row">
                    <td><input placeholder="L1" value={newRoom.roomId} onChange={(e) => setNewRoom({ ...newRoom, roomId: e.target.value })} /></td>
                    <td><input type="number" placeholder="120" value={newRoom.capacity} onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })} /></td>
                    <td>
                      <input
                        type="checkbox"
                        checked={newRoom.isLab}
                        onChange={(e) => setNewRoom({ ...newRoom, isLab: e.target.checked })}
                      />
                    </td>
                    <td><input placeholder="Academic Block" value={newRoom.building} onChange={(e) => setNewRoom({ ...newRoom, building: e.target.value })} /></td>
                    <td><input placeholder="1st" value={newRoom.floor} onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })} /></td>
                    <td><button className="btn btn-success btn-sm" onClick={handleAddRoom}><FaPlus /> Add</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============= SLOTS SECTION ============= */}
      {activeSection === 'slots' && (
        <div className="config-section fade-in">
          <div className="card">
            <h3>Time Slot Management</h3>
            <p className="section-description">Manage time slots for timetable scheduling.</p>
            
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Slot ID</th>
                    <th>Day</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr key={slot._id}>
                      {editingSlot && editingSlot._id === slot._id ? (
                        <>
                          <td><input value={editingSlot.slotId} onChange={(e) => setEditingSlot({ ...editingSlot, slotId: e.target.value })} /></td>
                          <td>
                            <select value={editingSlot.day} onChange={(e) => setEditingSlot({ ...editingSlot, day: e.target.value })}>
                              <option value="Monday">Monday</option>
                              <option value="Tuesday">Tuesday</option>
                              <option value="Wednesday">Wednesday</option>
                              <option value="Thursday">Thursday</option>
                              <option value="Friday">Friday</option>
                            </select>
                          </td>
                          <td><input type="time" value={editingSlot.startTime} onChange={(e) => setEditingSlot({ ...editingSlot, startTime: e.target.value })} /></td>
                          <td><input type="time" value={editingSlot.endTime} onChange={(e) => setEditingSlot({ ...editingSlot, endTime: e.target.value })} /></td>
                          <td>
                            <FaSave className="icon save-icon" onClick={() => handleUpdateSlot(slot._id)} />
                            <FaTimes className="icon cancel-icon" onClick={() => setEditingSlot(null)} />
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{slot.slotId}</td>
                          <td>{slot.day}</td>
                          <td>{slot.startTime}</td>
                          <td>{slot.endTime}</td>
                          <td>
                            <FaEdit className="icon edit-icon" onClick={() => setEditingSlot(slot)} />
                            <FaTrash className="icon delete-icon" onClick={() => handleDeleteSlot(slot._id)} />
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  <tr className="add-row">
                    <td><input placeholder="Mon-A" value={newSlot.slotId} onChange={(e) => setNewSlot({ ...newSlot, slotId: e.target.value })} /></td>
                    <td>
                      <select value={newSlot.day} onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                      </select>
                    </td>
                    <td><input type="time" placeholder="08:00" value={newSlot.startTime} onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })} /></td>
                    <td><input type="time" placeholder="09:00" value={newSlot.endTime} onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })} /></td>
                    <td><button className="btn btn-success btn-sm" onClick={handleAddSlot}><FaPlus /> Add</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationsPage;

