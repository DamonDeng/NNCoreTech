import { FaGithub } from 'react-icons/fa'  // Font Awesome icons
import { AiOutlineHome } from 'react-icons/ai'  // Ant Design icons
import { IoLogoTwitter } from 'react-icons/io'  // Ionicons

function Example() {
  return (
    <div>
      <FaGithub size={24} />  {/* GitHub icon */}
      <AiOutlineHome size={24} />  {/* Home icon */}
      <IoLogoTwitter size={24} color="blue" />  {/* Twitter icon */}
    </div>
  )
}

export default Example 