import { useState } from 'react';
import { Select, Section, Cell } from '@telegram-apps/telegram-ui';
import { getTelegramData } from '@telegram-apps/telegram-ui/dist/helpers/telegram';


function HomePage() {
    const [company, setCompany] = useState('');
    const [selectComponentColor, setSelectComponentColor] = useState('');

    const telegramData = getTelegramData();

    return (
        
          <Section header="Компания">
            <div style={{ backgroundColor: '${telegramData?.themeParams.section_bg_color}', color: 'var(--tgui--bg_color)' }}>
              <Select style={{ border: 'none', color: 'var(--tgui--text_color)' }}>
                <option>Компания А</option>
                <option>Компания Б</option>
              </Select>
            </div>
          </Section>  
     
    );
}

export default HomePage;