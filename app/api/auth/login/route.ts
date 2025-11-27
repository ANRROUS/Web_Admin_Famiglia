import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-key-change-this'
);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Faltan credenciales' },
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = await prisma.usuario.findUnique({
      where: { correo: email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar rol de administrador ('A')
    if (user.rol !== 'A') {
      return NextResponse.json(
        { error: 'No tienes permisos de administrador' },
        { status: 403 }
      );
    }

    // Verificar contraseña
    // Nota: Asegúrate de que las contraseñas en la DB estén hasheadas con bcrypt.
    // Si están en texto plano (mala práctica pero posible en dev), esto fallará.
    // Asumimos bcrypt.
    const isValid = await bcrypt.compare(password, user.contrase_a || '');

    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Generar Token
    const token = await new SignJWT({ 
        id: user.id_usuario.toString(), 
        email: user.correo, 
        rol: user.rol 
      })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    // Crear respuesta con cookie
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
