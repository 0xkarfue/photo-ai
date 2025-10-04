"use client"
import { useState } from "react"
import type React from "react"

import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      username: formData.username,
      password: formData.password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid username or password")
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-6">
        <div className="bg-zinc-950 rounded-2xl shadow-2xl p-8 border border-zinc-800/50">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Sign In</h1>
            <p className="text-zinc-400 text-sm">Access your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-950/50 border border-red-900/50 text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl focus:ring-2 focus:ring-zinc-700 focus:border-zinc-700 outline-none transition-all"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl focus:ring-2 focus:ring-zinc-700 focus:border-zinc-700 outline-none transition-all"
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-white text-black rounded-xl font-semibold hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center mt-8 text-zinc-500 text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-white hover:text-zinc-300 font-medium transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
