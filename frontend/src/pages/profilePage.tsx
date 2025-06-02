import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Select, Section, ColorInput, Cell, Radio } from '@telegram-apps/telegram-ui';
import { getTelegramData } from '@telegram-apps/telegram-ui/dist/helpers/telegram';


function ProfilePage() {
    const [company, setCompany] = useState('');
    const telegramData = getTelegramData();


    return (
        <>

        <Section 
          header="Цвет по умолчанию"
          style={{ backgroundColor: '${telegramData?.themeParams.section_bg_color}', color: 'var(--tgui--bg_color)'}}
          className='pb-6'
        >
            <div style={{ backgroundColor: '${telegramData?.themeParams.section_bg_color}', color: 'var(--tgui--bg_color)' }}>
                <ColorInput status="focused" placeholder={telegramData?.themeParams.link_color} value={telegramData?.themeParams.link_color} />
            </div>
            <Section.Footer style={{ color: 'var(--tgui--bg_color)'}}>
                Цвет приложения, по умолчанию - основные цвета телеграма
            </Section.Footer>
        </Section>

        <Section 
          header="Компания по умолчанию"
          style={{ backgroundColor: '${telegramData?.themeParams.section_bg_color}', color: 'var(--tgui--bg_color)'}}
          className='pb-6'
        >
            <div style={{ backgroundColor: '${telegramData?.themeParams.section_bg_color}', color: 'var(--tgui--bg_color)' }}>
                <Select 
                  status='focused'
                  style={{ border: 'none', color: 'var(--tgui--text_color)' }}>
                    <option>Компания А</option>
                    <option>Компания Б</option>
                </Select>
            </div>
            <Section.Footer style={{ color: 'var(--tgui--bg_color)'}}>
                Компания, задачи которой будут отображаться вам в первую очередь.
            </Section.Footer>
        </Section>
        
        <Section 
          header="ФИО для администратора"
          style={{ backgroundColor: '${telegramData?.themeParams.section_bg_color}', color: 'var(--tgui--bg_color)'}}
          className='pb-6'
        >
            <div style={{ backgroundColor: '${telegramData?.themeParams.section_bg_color}', color: 'var(--tgui--bg_color)' }}>
                <Select 
                  status='focused'
                  style={{ border: 'none', color: 'var(--tgui--text_color)' }}>
                    <option>Компания А</option>
                    <option>Компания Б</option>
                </Select>
            </div>
            <Section.Footer style={{ color: 'var(--tgui--bg_color)'}}>
                Имя, которое будет отображаться вашему администратору.
            </Section.Footer>
        </Section>

        <Section 
          header="Выполнение задания"
          style={{ backgroundColor: '${telegramData?.themeParams.section_bg_color}', color: 'var(--tgui--bg_color)'}}
          className='pb-6'
        >
            <div style={{ backgroundColor: '${telegramData?.themeParams.section_bg_color}', color: 'var(--tgui--bg_color)' }}>
                <Cell
                    className='flex items-center justify-between'
                    Component="label"
                    before={<Radio name="radio" value="1"/>}
                    
                >
                    <p style={{ color: 'var(--tgui--text_color)'}}>Чекбоксы</p>
                </Cell>
                <Cell
                    Component="label"
                    before={<Radio name="radio" value="2"/>}
                    multiline
                >
                    <p style={{ color: 'var(--tgui--text_color)'}}>Цвета</p>
                </Cell>
            </div>
            <Section.Footer style={{ color: 'var(--tgui--bg_color)'}}>
                При выборе цветов задания будут отмечены соответствующим цветом (зеленый / красный). Настройка цветов будет расширена.
            </Section.Footer>
        </Section>

        </> 
        
    );
}

export default ProfilePage;