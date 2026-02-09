import LaserFlow from '@/components/LaserFlow';
import { useRef } from 'react';

// NOTE: You can also adjust the variables in the shader for super detailed customization

// Basic Usage
<div style={{ height: '500px', position: 'relative', overflow: 'hidden' }}>
    <LaserFlow />
</div>

// Image Example Interactive Reveal Effect
const LaserFlowBoxExample = () => {
    const revealImgRef = useRef(null);

    return (
        <div className='bg-white max-w-[2000px]' style={{ height: 'auto', position: 'relative', overflow: 'hidden' }}>

            <LaserFlow
                horizontalBeamOffset={0.1}
                verticalBeamOffset={-0.1}
                color="#2d4ffb"
                // color='#000100'

                className='ml-52 -top-[210px] '
            />

            <div className='rounded-lg'
                style={{
                    position: 'absolute',
                    top: '39%',
                    left: '70%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    maxWidth: "850px",
                    border: '2px solid #FF79C6',
                    backgroundColor: '#060010',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '2rem',
                    zIndex: 6
                }}>
                {/* Your content here */}
                <div className='w-full h-full'>
                    <img src="/Hero-final-illustration.png" alt="" className='w-full object-cover rounded-lg' />
                </div>
            </div>
        </div>

    );
}

export default LaserFlowBoxExample