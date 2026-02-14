import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "../firebase";

interface Props {
  userId: string;
}

interface UserData {
  uid: string;
  name: string;
}

export function FriendsPage({ userId }: Props) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<UserData[]>([]);
  const [incoming, setIncoming] = useState<string[]>([]);
  const [friends, setFriends] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const snap = await getDoc(doc(db, "users", userId));
      const data = snap.data();
      setIncoming(data?.friendRequests?.incoming || []);
      setFriends(data?.friends || []);
    };

    loadData();
  }, [userId]);

  const searchUsers = async () => {
    if (!search) return;

    const q = query(
      collection(db, "users"),
      where("name", ">=", search),
      where("name", "<=", search + "\uf8ff")
    );

    const snap = await getDocs(q);
    const users = snap.docs
      .map(doc => ({ uid: doc.id, ...doc.data() } as UserData))
      .filter(user => user.uid !== userId);

    setResults(users);
  };

  const sendRequest = async (targetUid: string) => {
    await updateDoc(doc(db, "users", userId), {
      "friendRequests.outgoing": arrayUnion(targetUid)
    });

    await updateDoc(doc(db, "users", targetUid), {
      "friendRequests.incoming": arrayUnion(userId)
    });

    alert("Friend request sent!");
  };

  const acceptRequest = async (senderUid: string) => {
    await updateDoc(doc(db, "users", userId), {
      "friendRequests.incoming": arrayRemove(senderUid),
      friends: arrayUnion(senderUid)
    });

    await updateDoc(doc(db, "users", senderUid), {
      "friendRequests.outgoing": arrayRemove(userId),
      friends: arrayUnion(userId)
    });

    setIncoming(prev => prev.filter(id => id !== senderUid));
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl space-y-6">
      <h2 className="text-2xl font-bold">👥 Friends</h2>

      {/* Search */}
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
        <button
          onClick={searchUsers}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          Search
        </button>

        {results.map(user => (
          <div
            key={user.uid}
            className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
          >
            <span>{user.name}</span>
            <button
              onClick={() => sendRequest(user.uid)}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Add
            </button>
          </div>
        ))}
      </div>

      {/* Incoming Requests */}
      <div>
        <h3 className="font-semibold mb-2">Incoming Requests</h3>
        {incoming.length === 0 && <p>No requests</p>}
        {incoming.map(uid => (
          <div
            key={uid}
            className="flex justify-between items-center bg-yellow-50 p-3 rounded-lg mb-2"
          >
            <span>{uid}</span>
            <button
              onClick={() => acceptRequest(uid)}
              className="bg-indigo-600 text-white px-3 py-1 rounded"
            >
              Accept
            </button>
          </div>
        ))}
      </div>

      {/* Friends List */}
      <div>
        <h3 className="font-semibold mb-2">My Friends</h3>
        {friends.length === 0 && <p>No friends yet</p>}
        {friends.map(uid => (
          <div key={uid} className="bg-gray-100 p-2 rounded mb-1">
            {uid}
          </div>
        ))}
      </div>
    </div>
  );
}
