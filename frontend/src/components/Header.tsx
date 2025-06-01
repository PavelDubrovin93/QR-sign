import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SegmentedControl} from '@telegram-apps/telegram-ui';


function Header() {
    const [selected, setSelected] = useState(0);
    const navigate = useNavigate();

    return (
      <>
        <SegmentedControl>
          
          <SegmentedControl.Item
            onClick={() => [setSelected(0), navigate("/")]}
            selected={selected === 0}
          >
            Мои задачи
          </SegmentedControl.Item>

          <SegmentedControl.Item
            onClick={() => [setSelected(1), navigate("/scan")]}
            selected={selected === 1}
          >
            Сканировать
          </SegmentedControl.Item>

          <SegmentedControl.Item
            onClick={() => [setSelected(2), navigate("/profile")]}
            selected={selected === 2}
          >
            Профиль
          </SegmentedControl.Item>

        </SegmentedControl>
      </>
    );
}

export default Header;

// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// import { SegmentedControl} from '@telegram-apps/telegram-ui';
// import { getTelegramData } from '@telegram-apps/telegram-ui/dist/helpers/telegram';

// function Header() {
//     const [selected, setSelected] = useState(0);
//     const navigate = useNavigate();
//     const telegramData = getTelegramData();

//     return (
//       <>
        
//         <SegmentedControl style={{ backgroundColor: telegramData?.themeParams.section_bg_color }}>
//           <SegmentedControl.Item
//             onClick={() => [setSelected(0), navigate("/")]}
//             selected={selected === 0}
//             style={{ backgroundColor:  (selected === 0) ? telegramData?.themeParams.header_bg_color : telegramData?.themeParams.section_bg_color }}
//           >
//             Мои задачи
//           </SegmentedControl.Item>

//           <SegmentedControl.Item
//             onClick={() => [setSelected(1), navigate("/scan")]}
//             selected={selected === 1}
//             style={{ backgroundColor:  (selected === 1) ? telegramData?.themeParams.header_bg_color : telegramData?.themeParams.section_bg_color }}
//           >
//             Сканировать
//           </SegmentedControl.Item>

//           <SegmentedControl.Item
//             onClick={() => [setSelected(2), navigate("/profile")]}
//             selected={selected === 2}
//             style={{ backgroundColor:  (selected === 2) ? telegramData?.themeParams.header_bg_color : telegramData?.themeParams.section_bg_color }}
//           >
//             Профиль
//           </SegmentedControl.Item>

//       </SegmentedControl></>
//     );
// }

// export default Header;