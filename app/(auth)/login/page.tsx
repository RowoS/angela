export default async function Login() {
    return (
        <>
            <div className="flex min-h-screen items-center justify-center">
                <main className="bg-white max-w-sm w-full rounded">
                    <h1 className="text-black font-bold text-center mt-6">DOST</h1>
                    
                    {/* Place form and other things into components after finishing RBAC*/}
                    <form className="flex flex-col p-4">
                        <label htmlFor="email" className="text-black">Email:</label>
                        <input id="email" name="email" type="email" required className="border p-2 mt-2 rounded text-black"></input>

                        <label htmlFor="password" className="text-black mt-4">Password:</label>
                        <input id="password" name="password" type="password" required className="border p-2 mt-2 rounded text-black"></input>

                        <button className="bg-blue-950 text-white p-2 mt-6 rounded hover:bg-blue-400">
                            Log In
                        </button>
                        <button className='bg-blue-950 text-white p-2 mt-4 rounded hover:bg-blue-400'>
                            Sign Up
                        </button>
                    </form>
                </main>
            </div>
        </>
    );
}