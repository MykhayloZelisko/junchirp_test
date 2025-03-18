import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';

async function bootstrap(): Promise<void> {
  const PORT = Number(process.env.PORT) || 3000;
  const useSSL = process.env.USE_SSL === 'true';
  const isRender = process.env.RENDER_ENV === 'true';

  let httpsOptions: HttpsOptions | undefined;

  if (useSSL && !isRender) {
    httpsOptions = {
      key: fs.readFileSync(
        path.join(__dirname, '..', 'ssl', 'localhost-key.pem'),
      ),
      cert: fs.readFileSync(path.join(__dirname, '..', 'ssl', 'localhost.pem')),
    };
  }

  const app = await NestFactory.create(AppModule, { httpsOptions });

  app.enableCors({ origin: '*' });
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('JunChirp')
    .setDescription('The JunChirp API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${PORT}`);
  });
}
bootstrap();
