import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'https://simple-reservation-api.onrender.com/api/reservations';

function App() {
  const [reservations, setReservations] = useState([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch reservations
  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Ensure data is an array before setting state
      if (Array.isArray(data)) {
        setReservations(data);
      } else {
        console.error("API did not return an array:", data);
        setReservations([]); // Set to empty array if response is not as expected
        setError("Received invalid data format from server.");
      }
    } catch (e) {
      console.error("Failed to fetch reservations:", e);
      setError(`予約の取得に失敗しました: ${e.message}`);
      setReservations([]); // Clear reservations on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch reservations on component mount
  useEffect(() => {
    fetchReservations();
  }, []); // Empty dependency array means this runs once on mount

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    setLoading(true);
    setError(null);

    // Basic validation
    if (!name || !date || !time) {
        setError("すべてのフィールドを入力してください。");
        setLoading(false);
        return;
    }

    try {
      // Combine date and time into ISO 8601 datetime format
      const datetime = `${date}T${time}:00`;
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, datetime }),
      });

      if (!response.ok) {
        // Try to get error message from response body
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || JSON.stringify(errorData);
        } catch (parseError) {
            // Ignore if response body is not JSON or empty
        }
        throw new Error(errorMessage);
      }

      // Clear form and refresh list
      setName('');
      setDate('');
      setTime('');
      fetchReservations(); // Refresh the list after successful submission
    } catch (e) {
      console.error("Failed to create reservation:", e);
      setError(`予約の作成に失敗しました: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>予約システム</h1>

      {/* Reservation Creation Form */}
      <form onSubmit={handleSubmit}>
        <h2>新しい予約を作成</h2>
        <div>
          <label htmlFor="name">名前:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="date">日付:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="time">時間:</label>
          <input
            type="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? '作成中...' : '予約を作成'}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>

      {/* Reservation List */}
      <h2>既存の予約</h2>
      {loading && <p>読み込み中...</p>}
      {!loading && !error && reservations.length === 0 && <p>予約はありません。</p>}
      {!loading && reservations.length > 0 && (
        <ul>
          {reservations.map((reservation) => (
            <li key={reservation._id || reservation.id}> {/* Use _id from MongoDB or a unique id */}
              <strong>{reservation.name}</strong> - {
                reservation.datetime 
                  ? new Date(reservation.datetime).toLocaleString('ja-JP')
                  : `${new Date(reservation.date).toLocaleDateString()} ${reservation.time}`
              }
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
