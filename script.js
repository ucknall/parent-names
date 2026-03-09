const { useState, useEffect } = React;

const App = () => {
    // State for data
    const [data, setData] = useState(() => {
        const saved = localStorage.getItem('parent-names-data');
        return saved ? JSON.parse(saved) : { children: [] };
    });

    // Navigation state: { screen: 'dashboard' | 'child' | 'friend-form' | 'child-form', childId?, friendId? }
    const [view, setView] = useState({ screen: 'dashboard' });

    // Persist data
    useEffect(() => {
        localStorage.setItem('parent-names-data', JSON.stringify(data));
    }, [data]);

    // Actions
    const addChild = (name) => {
        const newChild = { id: Date.now().toString(), name, friends: [] };
        setData(prev => ({ ...prev, children: [...prev.children, newChild] }));
        setView({ screen: 'dashboard' });
    };

    const addFriend = (childId, friend) => {
        setData(prev => ({
            ...prev,
            children: prev.children.map(c => 
                c.id === childId 
                ? { ...c, friends: [...c.friends, { ...friend, id: Date.now().toString() }] }
                : c
            )
        }));
        setView({ screen: 'child', childId });
    };

    const deleteChild = (id) => {
        if (confirm('Delete this child and all their friends?')) {
            setData(prev => ({ ...prev, children: prev.children.filter(c => c.id !== id) }));
            setView({ screen: 'dashboard' });
        }
    };

    const deleteFriend = (childId, friendId) => {
        if (confirm('Delete this friend?')) {
            setData(prev => ({
                ...prev,
                children: prev.children.map(c => 
                    c.id === childId 
                    ? { ...c, friends: c.friends.filter(f => f.id !== friendId) }
                    : c
                )
            }));
            setView({ screen: 'child', childId });
        }
    };

    // Components
    const Header = ({ title, onBack }) => (
        <div className="bg-black text-white p-6 sticky top-0 z-10 flex items-center shadow-md mb-6">
            {onBack && (
                <button onClick={onBack} className="mr-4 text-2xl">←</button>
            )}
            <h1 className="text-xl font-black uppercase tracking-tight">{title}</h1>
        </div>
    );

    const Dashboard = () => (
        <div className="px-4 pb-20">
            <Header title="My Children" />
            {data.children.length === 0 ? (
                <p className="text-center text-gray-500 my-10">No children added yet.</p>
            ) : (
                data.children.map(child => (
                    <div key={child.id} className="card flex justify-between items-center" onClick={() => setView({ screen: 'child', childId: child.id })}>
                        <span className="text-xl font-bold">{child.name}</span>
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-bold">{child.friends.length} Friends</span>
                    </div>
                ))
            )}
            <button 
                className="btn-high-contrast mt-4"
                onClick={() => setView({ screen: 'child-form' })}
            >
                + Add Child
            </button>
        </div>
    );

    const ChildView = ({ childId }) => {
        const child = data.children.find(c => c.id === childId);
        if (!child) return null;

        return (
            <div className="px-4 pb-20">
                <Header title={child.name} onBack={() => setView({ screen: 'dashboard' })} />
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Friends</h2>
                    <button onClick={() => deleteChild(child.id)} className="text-red-600 font-bold">Delete Child</button>
                </div>
                {child.friends.length === 0 ? (
                    <p className="text-center text-gray-500 my-10">No friends listed for {child.name}.</p>
                ) : (
                    child.friends.map(friend => (
                        <div key={friend.id} className="card" onClick={() => setView({ screen: 'friend-details', childId, friendId: friend.id })}>
                            <div className="font-bold text-lg">{friend.name}</div>
                            <div className="text-gray-600 text-sm">Parents: {friend.parents}</div>
                        </div>
                    ))
                )}
                <button 
                    className="btn-high-contrast mt-4"
                    onClick={() => setView({ screen: 'friend-form', childId })}
                >
                    + Add Friend
                </button>
            </div>
        );
    };

    const FriendDetails = ({ childId, friendId }) => {
        const child = data.children.find(c => c.id === childId);
        const friend = child?.friends.find(f => f.id === friendId);
        if (!friend) return null;

        return (
            <div className="px-4 pb-20">
                <Header title={friend.name} onBack={() => setView({ screen: 'child', childId })} />
                <div className="card space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase">Parents</label>
                        <div className="text-xl font-bold">{friend.parents || 'Not set'}</div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase">Siblings</label>
                        <div className="text-xl font-bold">{friend.siblings || 'None'}</div>
                    </div>
                </div>
                <button 
                    className="w-full text-red-600 font-bold p-4 mt-8 border-2 border-red-600 rounded-lg"
                    onClick={() => deleteFriend(childId, friendId)}
                >
                    Delete Friend
                </button>
            </div>
        );
    };

    const ChildForm = () => {
        const [name, setName] = useState('');
        return (
            <div className="px-4">
                <Header title="Add Child" onBack={() => setView({ screen: 'dashboard' })} />
                <div className="card">
                    <label className="block font-bold mb-2">Child's Name</label>
                    <input 
                        autoFocus
                        className="w-full p-4 border-2 border-black rounded-lg text-lg"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Oliver"
                    />
                </div>
                <button 
                    className="btn-high-contrast"
                    onClick={() => name && addChild(name)}
                >
                    Save Child
                </button>
            </div>
        );
    };

    const FriendForm = ({ childId }) => {
        const [f, setF] = useState({ name: '', parents: '', siblings: '' });
        return (
            <div className="px-4">
                <Header title="New Friend" onBack={() => setView({ screen: 'child', childId })} />
                <div className="card space-y-4">
                    <div>
                        <label className="block font-bold mb-1">Friend's Name</label>
                        <input 
                            className="w-full p-3 border-2 border-black rounded-lg"
                            value={f.name}
                            onChange={e => setF({...f, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-1">Parents' Names</label>
                        <input 
                            className="w-full p-3 border-2 border-black rounded-lg"
                            value={f.parents}
                            onChange={e => setF({...f, parents: e.target.value})}
                            placeholder="e.g. Sarah & Mike"
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-1">Siblings</label>
                        <input 
                            className="w-full p-3 border-2 border-black rounded-lg"
                            value={f.siblings}
                            onChange={e => setF({...f, siblings: e.target.value})}
                        />
                    </div>
                </div>
                <button 
                    className="btn-high-contrast"
                    onClick={() => f.name && addFriend(childId, f)}
                >
                    Save Friend
                </button>
            </div>
        );
    };

    // Render logic
    switch(view.screen) {
        case 'child': return <ChildView childId={view.childId} />;
        case 'friend-details': return <FriendDetails childId={view.childId} friendId={view.friendId} />;
        case 'child-form': return <ChildForm />;
        case 'friend-form': return <FriendForm childId={view.childId} />;
        default: return <Dashboard />;
    }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
