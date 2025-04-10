import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { registerLicense } from '@syncfusion/ej2-base';

registerLicense('Ngo9BigBOggjHTQxAR8/V1NMaF1cXmhKYVJyWmFZfVtgcl9HZlZQRWYuP1ZhSXxWdkZjXn9YcXJUR2FbWUI='); // Replace with your actual license key



platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
