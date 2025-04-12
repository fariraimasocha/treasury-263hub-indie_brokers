import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import User from '@/models/user'
import bcrypt from 'bcryptjs'
import { connect } from '@/utils/connect'

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, email, phone, currentPassword, newPassword } = body

    await connect()
    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Handle password update if provided
    if (currentPassword && newPassword) {
      if (!user.password) {
        return NextResponse.json(
          { error: 'No password set for this user' },
          { status: 400 }
        )
      }

      const isValid = await bcrypt.compare(currentPassword, user.password)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12)
      user.password = hashedPassword
    } else if (currentPassword || newPassword) {
      return NextResponse.json(
        { error: 'Both current and new passwords are required to change password' },
        { status: 400 }
      )
    }

    // Update other fields if provided
    if (name) user.name = name
    if (email) user.email = email
    if (phone) user.phone = phone

    await user.save()

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
